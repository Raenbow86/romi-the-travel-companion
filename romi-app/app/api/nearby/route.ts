import { NextRequest, NextResponse } from "next/server";

type Center = { lat: number; lng: number; radius: number };

type NearbyPlace = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  icon: string;
  helpsWith: string[];
  description: string;
  note: string;
  website?: string;
  hours?: string;
  rating?: number;
  reviewCount?: number;
  reviewSnippet?: string;
  source: "google" | "openstreetmap";
};

const NEED_TAGS: Record<string, string[]> = {
  Sleep: ['["tourism"="camp_site"]', '["tourism"="hotel"]'],
  Food: [
    '["amenity"="restaurant"]',
    '["amenity"="cafe"]',
    '["shop"="bakery"]',
    '["shop"="supermarket"]',
  ],
  Fuel: ['["amenity"="fuel"]'],
  Water: ['["amenity"="drinking_water"]'],
  Shower: ['["amenity"="shower"]'],
  Laundry: ['["amenity"="laundry"]'],
  Adventure: ['["tourism"="viewpoint"]', '["leisure"="park"]'],
  "Adult-friendly": [
    '["craft"="winery"]',
    '["shop"="wine"]',
    '["shop"="alcohol"]',
    '["amenity"="bar"]',
    '["amenity"="pub"]',
    '["craft"="brewery"]',
  ],
  "Wi‑Fi & Cell": ['["internet_access"="wlan"]'],
  "Dog Needs": ['["dog"="yes"]'],
  Power: ['["amenity"="charging_station"]'],
};

const GOOGLE_TYPES: Record<string, string> = {
  Sleep: "campground",
  Food: "restaurant",
  Fuel: "gas_station",
  Laundry: "laundry",
  Adventure: "park",
  "Adult-friendly": "bar",
  Power: "electric_vehicle_charging_station",
};

const ICONS: Record<string, string> = {
  Sleep: "🏕️",
  Food: "🍔",
  Fuel: "⛽",
  Water: "💧",
  Shower: "🚿",
  Laundry: "🧺",
  Adventure: "🏞️",
  "Adult-friendly": "🍷",
  "Wi‑Fi & Cell": "📶",
  "Dog Needs": "🐾",
  Power: "⚡",
};

function centerFor(area: string, lat?: number, lng?: number, radius?: number): Center {
  if (typeof lat === "number" && !Number.isNaN(lat) && typeof lng === "number" && !Number.isNaN(lng)) {
    return { lat, lng, radius: radius && radius > 0 ? radius : 32000 };
  }
  const q = area.toLowerCase();
  if (q.includes("lodgepole") || q.includes("taylor")) {
    return { lat: 38.7616, lng: -106.6623, radius: 18000 };
  }
  if (q.includes("almont")) {
    return { lat: 38.6639, lng: -106.8467, radius: 16000 };
  }
  if (q.includes("gunnison") || q.includes("powerstop")) {
    return { lat: 38.545, lng: -106.925, radius: 16000 };
  }
  if (q.includes("hotchkiss")) {
    return { lat: 38.8, lng: -107.72, radius: 18000 };
  }
  if (q.includes("cedaredge")) {
    return { lat: 38.9014, lng: -107.9263, radius: 14000 };
  }
  if (q.includes("curecanti")) {
    return { lat: 38.4536, lng: -107.3482, radius: 20000 };
  }
  if (q.includes("paonia") || q.includes("wine") || q.includes("north fork")) {
    return { lat: 38.8684, lng: -107.5924, radius: 20000 };
  }
  return { lat: 38.545, lng: -106.925, radius: 18000 };
}

function tagsFor(needs: string[]): string[] {
  const tags = new Set<string>();
  const list = needs.length > 0 ? needs : ["Sleep", "Food", "Fuel"];
  for (const need of list) {
    for (const tag of NEED_TAGS[need] || []) tags.add(tag);
  }
  return [...tags];
}

function helpsFromGoogleTypes(types: string[] = []): string[] {
  const found = new Set<string>();
  for (const t of types) {
    if (["campground", "rv_park", "lodging"].includes(t)) found.add("Sleep");
    if (["restaurant", "cafe", "bakery", "meal_takeaway", "supermarket"].includes(t)) {
      found.add("Food");
    }
    if (t === "gas_station") found.add("Fuel");
    if (t === "laundry") found.add("Laundry");
    if (["park", "campground", "natural_feature"].includes(t)) found.add("Adventure");
    if (["liquor_store", "bar", "winery", "night_club"].includes(t) || t.includes("brew")) {
      found.add("Adult-friendly");
    }
    if (t === "cafe") found.add("Wi‑Fi & Cell");
    if (t === "electric_vehicle_charging_station") found.add("Power");
    if (t === "pet_store") found.add("Dog Needs");
  }
  return [...found];
}

function compactName(value: string) {
  return value
    .toLowerCase()
    .replace(/[''`´]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^the/, "");
}

function excludeMatch(name: string, exclude: string[]) {
  const n = compactName(name);
  return exclude.some((ex) => {
    const e = compactName(ex);
    if (!n || !e) return false;
    return n === e || n.includes(e) || e.includes(n);
  });
}

async function fromGoogle(
  area: string,
  needs: string[],
  exclude: string[],
  origin?: { lat: number; lng: number; radius?: number },
): Promise<NearbyPlace[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  const center = centerFor(area, origin?.lat, origin?.lng, origin?.radius);
  const primary = needs[0] || "Food";
  const type = GOOGLE_TYPES[primary] || "point_of_interest";
  const keyword = [...needs, area].join(" ");

  const nearbyUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  nearbyUrl.searchParams.set("location", `${center.lat},${center.lng}`);
  nearbyUrl.searchParams.set("radius", String(Math.min(center.radius, 20000)));
  nearbyUrl.searchParams.set("keyword", keyword);
  nearbyUrl.searchParams.set("type", type);
  nearbyUrl.searchParams.set("key", key);

  const nearbyRes = await fetch(nearbyUrl.toString(), { cache: "no-store" });
  if (!nearbyRes.ok) return [];
  const nearbyJson = (await nearbyRes.json()) as {
    status?: string;
    error_message?: string;
    results?: Array<{ place_id: string; name: string }>;
  };
  if (nearbyJson.status && nearbyJson.status !== "OK" && nearbyJson.status !== "ZERO_RESULTS") {
    throw new Error(nearbyJson.error_message || nearbyJson.status);
  }

  const ids = (nearbyJson.results || [])
    .filter((r) => r.place_id && r.name && !excludeMatch(r.name, exclude))
    .slice(0, 8)
    .map((r) => r.place_id);

  const detailed = await Promise.all(
    ids.map(async (placeId) => {
      const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
      detailsUrl.searchParams.set("place_id", placeId);
      detailsUrl.searchParams.set(
        "fields",
        "name,formatted_address,geometry,website,url,formatted_phone_number,opening_hours,rating,user_ratings_total,editorial_summary,reviews,types",
      );
      detailsUrl.searchParams.set("key", key);
      const res = await fetch(detailsUrl.toString(), { cache: "no-store" });
      if (!res.ok) return null;
      const json = (await res.json()) as { result?: GoogleDetails };
      return json.result || null;
    }),
  );

  return detailed
    .filter((place): place is GoogleDetails => Boolean(place?.name && place.geometry?.location))
    .map((place) => {
      const helpsWith = helpsFromGoogleTypes(place.types);
      const primaryNeed = helpsWith[0] || primary;
      const review = place.reviews?.[0]?.text?.replace(/\s+/g, " ").slice(0, 220);
      const hours = place.opening_hours?.weekday_text?.slice(0, 2).join(" · ");
      const summary =
        place.editorial_summary?.overview ||
        (place.rating
          ? `Google visitors rate this ${place.rating}★` +
            (place.user_ratings_total ? ` from ${place.user_ratings_total} reviews.` : ".")
          : "Listed on Google. A Romi scout has not confirmed it yet.");

      const noteParts = [
        hours ? `Hours (Google): ${hours}` : null,
        place.formatted_phone_number ? `Phone ${place.formatted_phone_number}` : null,
        "Not scout-verified — treat this as a lead, then go see it.",
      ].filter(Boolean);

      return {
        id: `google-${place.name}-${place.geometry!.location.lat}`,
        name: place.name!,
        area: place.formatted_address || area,
        lat: place.geometry!.location.lat,
        lng: place.geometry!.location.lng,
        icon: ICONS[primaryNeed] || "📍",
        helpsWith,
        description: summary,
        note: noteParts.join(" "),
        website: place.website || place.url,
        hours,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        reviewSnippet: review,
        source: "google" as const,
      };
    });
}

type GoogleDetails = {
  name?: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
  website?: string;
  url?: string;
  formatted_phone_number?: string;
  opening_hours?: { weekday_text?: string[] };
  rating?: number;
  user_ratings_total?: number;
  editorial_summary?: { overview?: string };
  reviews?: Array<{ text?: string }>;
  types?: string[];
};

async function fromOsm(
  area: string,
  needs: string[],
  exclude: string[],
  origin?: { lat: number; lng: number; radius?: number },
): Promise<NearbyPlace[]> {
  const center = centerFor(area, origin?.lat, origin?.lng, origin?.radius);
  const filters = tagsFor(needs)
    .map((tag) => `nwr${tag}(around:${center.radius},${center.lat},${center.lng});`)
    .join("\n");
  const query = `[out:json][timeout:18];\n(\n${filters}\n);\nout center;`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    cache: "no-store",
  });
  if (!response.ok) return [];

  const data = (await response.json()) as {
    elements?: Array<{
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  const mapped: NearbyPlace[] = [];
  for (const el of data.elements || []) {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      const tags = el.tags || {};
      const name = tags.name;
      if (!lat || !lng || !name || excludeMatch(name, exclude)) continue;

      const helpsWith = Object.entries(NEED_TAGS)
        .filter(([, osmTags]) =>
          osmTags.some((tag) => {
            const key = tag.match(/\["([^"]+)"/)?.[1];
            const val = tag.match(/"([^"]+)"\]/)?.[1];
            return key && val && tags[key] === val;
          }),
        )
        .map(([need]) => need);

      const bits = [
        tags.cuisine?.replace(/;/g, ", "),
        tags.amenity?.replace(/_/g, " "),
        tags.shop?.replace(/_/g, " "),
        tags.tourism?.replace(/_/g, " "),
        tags.internet_access === "wlan" ? "Wi‑Fi listed" : null,
        tags.dog === "yes" ? "map says dog-friendly" : null,
      ].filter(Boolean);

      const website = tags.website || tags["contact:website"];
      const hours = tags.opening_hours;
      const phone = tags.phone || tags["contact:phone"];
      const primary = helpsWith[0] || "Adventure";

      mapped.push({
        id: `osm-${el.id}`,
        name,
        area: area || "Nearby",
        lat,
        lng,
        icon: ICONS[primary] || "📍",
        helpsWith,
        description: bits.length
          ? `Map listing: ${bits.join(" · ")}. Not scout-verified yet.`
          : "Nearby map listing. A Romi scout has not confirmed this stop yet.",
        note: [
          hours ? `Hours on the map: ${hours}` : null,
          phone ? `Phone ${phone}` : null,
          "Confirm before you go — this is not a Romi scout report.",
        ]
          .filter(Boolean)
          .join(" "),
        website,
        hours,
        source: "openstreetmap",
      });
  }
  return mapped.slice(0, 12);
}

function fallbackPlaces(area: string, exclude: string[]): NearbyPlace[] {
  const q = area.toLowerCase();
  const paonia = q.includes("paonia") || q.includes("hotchkiss") || q.includes("wine");
  const gunnison = q.includes("gunnison") || q.includes("almont") || q.includes("lodgepole");
  const list: NearbyPlace[] = paonia
    ? [
        {
          id: "lead-stone-cottage",
          name: "Stone Cottage Cellars",
          area: "Paonia, Colorado",
          lat: 38.8706,
          lng: -107.612,
          icon: "🍷",
          helpsWith: ["Adult-friendly", "Adventure"],
          description:
            "High-mesa tasting room above Paonia. Listed as a wine stop — not scout-verified in ROMI yet.",
          note: "Confirm hours and the drive up. A scout has not filed a ROMI report.",
          website: "https://www.stonecottagecellars.com/",
          source: "openstreetmap",
        },
        {
          id: "lead-azura",
          name: "Azura Cellars",
          area: "Paonia, Colorado",
          lat: 38.873,
          lng: -107.62,
          icon: "🍷",
          helpsWith: ["Adult-friendly", "Food", "Adventure"],
          description:
            "Winery and views west of town. Map/Google listing only until a scout goes.",
          note: "Seasonal tasting hours. Not scout-verified.",
          website: "https://www.azuracellars.com/",
          source: "openstreetmap",
        },
        {
          id: "lead-living-farm",
          name: "The Living Farm Cafe",
          area: "Paonia, Colorado",
          lat: 38.8689,
          lng: -107.5928,
          icon: "🥬",
          helpsWith: ["Food"],
          description:
            "Farm cafe in Paonia. Useful food lead — needs a real ROMI scout report.",
          note: "Confirm open days. Not scout-verified.",
          source: "openstreetmap",
        },
      ]
    : gunnison
      ? [
          {
            id: "lead-city-market",
            name: "City Market",
            area: "Gunnison, Colorado",
            lat: 38.5519,
            lng: -106.9272,
            icon: "🛒",
            helpsWith: ["Food"],
            description:
              "Main grocery on N Main. Resupply lead — not a scout-verified ROMI card yet.",
            note: "880 N Main St. Confirm hours. Not scout-verified.",
            source: "openstreetmap",
          },
          {
            id: "lead-high-alpine",
            name: "High Alpine Brewing",
            area: "Gunnison, Colorado",
            lat: 38.5447,
            lng: -106.9275,
            icon: "🍔",
            helpsWith: ["Food"],
            description:
              "Downtown brewery and food. Google/map lead until a scout reports.",
            note: "Not scout-verified.",
            source: "openstreetmap",
          },
        ]
      : [];
  return list.filter((place) => !excludeMatch(place.name, exclude));
}

export async function GET(request: NextRequest) {
  const area = request.nextUrl.searchParams.get("area") || "";
  const needs = (request.nextUrl.searchParams.get("needs") || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const exclude = (request.nextUrl.searchParams.get("exclude") || "")
    .toLowerCase()
    .split("|")
    .filter(Boolean);
  const latNum = Number(request.nextUrl.searchParams.get("lat"));
  const lngNum = Number(request.nextUrl.searchParams.get("lng"));
  const radiusNum = Number(request.nextUrl.searchParams.get("radius"));
  const origin =
    !Number.isNaN(latNum) && !Number.isNaN(lngNum)
      ? { lat: latNum, lng: lngNum, radius: Number.isNaN(radiusNum) ? 32000 : radiusNum }
      : undefined;

  let googleError = "";
  try {
    const google = await fromGoogle(area, needs, exclude, origin);
    if (google.length > 0) {
      return NextResponse.json({ places: google, source: "google" });
    }
  } catch (err) {
    googleError = err instanceof Error ? err.message : "google-failed";
  }

  try {
    const osm = await fromOsm(area, needs, exclude, origin);
    if (osm.length > 0) {
      return NextResponse.json({
        places: osm,
        source: "openstreetmap",
        googleError: googleError || undefined,
      });
    }
  } catch {
    // fall through to local leads
  }

  return NextResponse.json({
    places: fallbackPlaces(area, exclude),
    source: "fallback",
    googleError: googleError || undefined,
  });
}

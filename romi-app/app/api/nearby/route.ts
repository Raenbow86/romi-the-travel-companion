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
  hoursFull?: string;
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
    if (t === "pet_store" || t === "veterinary_care" || t === "dog_park") found.add("Dog Needs");
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

const NEED_QUERIES: Record<string, Array<{ type: string; keyword: string }>> = {
  Sleep: [
    { type: "campground", keyword: "campground" },
    { type: "rv_park", keyword: "rv park" },
    { type: "lodging", keyword: "cabin motel" },
  ],
  Fuel: [{ type: "gas_station", keyword: "gas station diesel" }],
  Food: [
    { type: "restaurant", keyword: "restaurant" },
    { type: "cafe", keyword: "cafe bakery" },
    { type: "supermarket", keyword: "grocery" },
  ],
  Laundry: [{ type: "laundry", keyword: "laundromat" }],
  Adventure: [
    { type: "park", keyword: "trail park" },
    { type: "tourist_attraction", keyword: "hike fishing viewpoint" },
  ],
  "Adult-friendly": [
    { type: "bar", keyword: "bar brewery" },
    { type: "liquor_store", keyword: "liquor wine" },
  ],
  Power: [{ type: "electric_vehicle_charging_station", keyword: "charging" }],
  Shower: [
    { type: "campground", keyword: "campground" },
    { type: "rv_park", keyword: "rv park" },
    { type: "spa", keyword: "hot springs soak" },
  ],
  Water: [
    { type: "campground", keyword: "potable water fill" },
    { type: "rv_park", keyword: "water fill" },
  ],
  "Dog Needs": [
    { type: "park", keyword: "dog park" },
    { type: "pet_store", keyword: "pet store dog" },
    { type: "veterinary_care", keyword: "veterinarian" },
    { type: "restaurant", keyword: "dog friendly patio" },
  ],
  "Wi‑Fi & Cell": [{ type: "cafe", keyword: "wifi" }],
};

function todayHours(weekdayText?: string[], openNow?: boolean) {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const line = weekdayText?.find((entry) =>
    entry.toLowerCase().startsWith(day.toLowerCase()),
  );
  const today = line ? line.replace(/^[^:]+:\s*/, "") : "";
  if (openNow === true) return today && today.toLowerCase() !== "closed" ? `Open now · ${today}` : "Open now";
  if (openNow === false) return today ? `Closed now · ${today}` : "Closed now";
  return today || "";
}

function compileBlurb(place: GoogleDetails) {
  const editorial = place.editorial_summary?.overview?.replace(/\s+/g, " ").trim();
  const review = place.reviews?.[0]?.text?.replace(/\s+/g, " ").trim() || "";
  const firstThought = review.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ").slice(0, 220);
  if (editorial) return editorial.slice(0, 240);
  if (firstThought) return firstThought;
  if (place.rating) {
    return `Google visitors rate this ${place.rating}★` +
      (place.user_ratings_total ? ` from ${place.user_ratings_total} reviews.` : ".");
  }
  return "Google listing nearby. Open the card for hours and visitor notes.";
}

function looksWrongForNeeds(types: string[] = [], needs: string[]) {
  const reject = [
    "general_contractor",
    "roofing_contractor",
    "electrician",
    "plumber",
    "car_repair",
    "car_dealer",
    "real_estate_agency",
    "insurance_agency",
    "lawyer",
    "storage",
    "moving_company",
    "hardware_store",
    "home_goods_store",
  ];
  const amenity = [
    "campground",
    "rv_park",
    "lodging",
    "gas_station",
    "restaurant",
    "cafe",
    "park",
    "spa",
    "gym",
    "bar",
    "supermarket",
    "laundry",
  ];
  if (types.some((t) => reject.includes(t)) && !types.some((t) => amenity.includes(t))) {
    return true;
  }
  if (needs.includes("Shower")) {
    return !types.some((t) =>
      ["campground", "rv_park", "lodging", "spa", "gym", "gas_station"].includes(t),
    );
  }
  return false;
}

async function nearbyIdsFor(
  center: Center,
  type: string,
  keyword: string,
  key: string,
): Promise<string[]> {
  const nearbyUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  nearbyUrl.searchParams.set("location", `${center.lat},${center.lng}`);
  nearbyUrl.searchParams.set("radius", String(Math.min(center.radius, 50000)));
  nearbyUrl.searchParams.set("type", type);
  nearbyUrl.searchParams.set("keyword", keyword);
  nearbyUrl.searchParams.set("key", key);
  const nearbyRes = await fetch(nearbyUrl.toString(), { cache: "no-store" });
  if (!nearbyRes.ok) return [];
  const nearbyJson = (await nearbyRes.json()) as {
    status?: string;
    results?: Array<{ place_id: string; name: string }>;
  };
  if (nearbyJson.status && nearbyJson.status !== "OK" && nearbyJson.status !== "ZERO_RESULTS") {
    throw new Error(nearbyJson.status);
  }
  return (nearbyJson.results || []).slice(0, 5).map((r) => r.place_id).filter(Boolean);
}

async function fromGoogle(
  area: string,
  needs: string[],
  exclude: string[],
  origin?: { lat: number; lng: number; radius?: number },
  extra?: string,
): Promise<NearbyPlace[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  const center = centerFor(area, origin?.lat, origin?.lng, origin?.radius);
  const selected = needs.length > 0 ? needs : extra ? [] : ["Food", "Fuel", "Sleep"];
  const queries: Array<{ type: string; keyword: string; need?: string }> = selected.flatMap((need) =>
    (NEED_QUERIES[need] || [{ type: "point_of_interest", keyword: need }]).map((query) => ({
      ...query,
      need,
    })),
  );
  const phrase = (extra || "").trim().slice(0, 80);
  if (phrase) {
    queries.unshift({ type: "point_of_interest", keyword: phrase, need: selected[0] });
    if (selected.includes("Adult-friendly") || /bar|beer|wine|golf|brew|cart/i.test(phrase)) {
      queries.unshift({ type: "bar", keyword: phrase, need: "Adult-friendly" });
      queries.unshift({ type: "tourist_attraction", keyword: phrase, need: "Adult-friendly" });
    }
    if (selected.includes("Adventure") || /hike|trail|jeep|atv|raft/i.test(phrase)) {
      queries.unshift({ type: "park", keyword: phrase, need: "Adventure" });
    }
    if (selected.includes("Dog Needs") || /dog|pup|vet|leash/i.test(phrase)) {
      queries.unshift({ type: "park", keyword: phrase, need: "Dog Needs" });
      queries.unshift({ type: "pet_store", keyword: phrase, need: "Dog Needs" });
    }
  }

  const idToNeeds = new Map<string, Set<string>>();
  const idSets = await Promise.all(
    queries.map(async (query) => {
      const foundIds = await nearbyIdsFor(center, query.type, query.keyword, key);
      for (const id of foundIds) {
        const set = idToNeeds.get(id) || new Set<string>();
        if (query.need) set.add(query.need);
        idToNeeds.set(id, set);
      }
      return foundIds;
    }),
  );
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const group of idSets) {
    for (const id of group) {
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
      if (ids.length >= 12) break;
    }
    if (ids.length >= 12) break;
  }

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
      return json.result ? { ...json.result, placeId } : null;
    }),
  );

  return detailed
    .filter((place): place is GoogleDetails & { placeId: string } =>
      Boolean(
        place?.name &&
          place.geometry?.location &&
          !excludeMatch(place.name || "", exclude) &&
          !looksWrongForNeeds(place.types, selected),
      ),
    )
    .map((place) => {
      const helpsWith = [
        ...new Set([
          ...helpsFromGoogleTypes(place.types),
          ...(idToNeeds.get(place.placeId) || []),
        ]),
      ];
      const primaryNeed = selected.find((need) => helpsWith.includes(need)) || helpsWith[0] || selected[0];
      const hoursToday = todayHours(place.opening_hours?.weekday_text, place.opening_hours?.open_now);
      const hoursFull = (place.opening_hours?.weekday_text || []).join("\n");
      const review = place.reviews?.[0]?.text?.replace(/\s+/g, " ").slice(0, 280);

      return {
        id: place.placeId,
        name: place.name!,
        area: place.formatted_address || area,
        lat: place.geometry!.location.lat,
        lng: place.geometry!.location.lng,
        icon: ICONS[primaryNeed] || "📍",
        helpsWith,
        description: compileBlurb(place),
        note: hoursToday || "Hours not listed — confirm before you go.",
        website: place.website || place.url,
        hours: hoursToday,
        hoursFull,
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
  opening_hours?: { weekday_text?: string[]; open_now?: boolean };
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
  const extra = (request.nextUrl.searchParams.get("extra") || "").trim();
  const latNum = Number(request.nextUrl.searchParams.get("lat"));
  const lngNum = Number(request.nextUrl.searchParams.get("lng"));
  const radiusNum = Number(request.nextUrl.searchParams.get("radius"));
  const origin =
    !Number.isNaN(latNum) && !Number.isNaN(lngNum)
      ? { lat: latNum, lng: lngNum, radius: Number.isNaN(radiusNum) ? 32000 : radiusNum }
      : undefined;

  let googleError = "";
  try {
    const google = await fromGoogle(area, needs, exclude, origin, extra);
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

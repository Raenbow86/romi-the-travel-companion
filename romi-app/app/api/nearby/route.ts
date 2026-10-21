import { clipWords } from "@/app/romi/text";
import { extractHighlights, pickQuote } from "@/app/romi/highlights";
import { NextRequest, NextResponse } from "next/server";
import { NEEDS, NEED_BY_LABEL, classify, iconForNeed, passesNeedFilter, pickedSubChips, type NeedLabel } from "@/lib/needs";

type Center = { lat: number; lng: number; radius: number };

type NearbyPlace = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  icon: string;
  helpsWith: NeedLabel[];
  subChips: string[];
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

/** OSM tag filters for the picked needs. If a need has sub-chips picked, only those sub-chips' tags. */
function tagsFor(needs: string[], subs: Record<string, string[]>): string[] {
  const tags = new Set<string>();
  const list = needs.length > 0 ? needs : ["Sleep", "Food", "Fuel"];
  for (const need of list) {
    const def = NEED_BY_LABEL[need];
    if (!def) continue;
    const picked = def.subChips.filter((s) => subs[need]?.includes(s.label));
    const source = picked.length ? picked.flatMap((s) => s.osm) : def.osm;
    for (const tag of source) tags.add(tag);
  }
  return [...tags];
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
  const firstThought = clipWords(review.split(/(?<=[.!?])\s+/).slice(0, 2).join(" "), 220);
  if (editorial) return clipWords(editorial, 240);
  if (firstThought) return firstThought;
  if (place.rating) {
    return `Google visitors rate this ${place.rating}★` +
      (place.user_ratings_total ? ` from ${place.user_ratings_total} reviews.` : ".");
  }
  return "Google listing nearby. Open the card for hours and visitor notes.";
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
  const phrase = (extra || "").trim();
  const subs = pickedSubChips(selected, phrase.split(","));
  const queries: Array<{ type: string; keyword: string; need?: string }> = [];

  for (const need of selected) {
    const def = NEED_BY_LABEL[need];
    if (!def) continue;
    const picked = def.subChips.filter((sub) => subs[need]?.includes(sub.label));
    for (const query of picked.length ? picked.flatMap((sub) => sub.google) : def.google) {
      queries.push({ ...query, need });
    }
  }

  // Free-form words that are not sub-chips become one extra keyword search.
  const freeWords = phrase
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w && !NEEDS.some((d) => d.subChips.some((sub) => sub.label.toLowerCase() === w.toLowerCase())))
    .join(" ");
  if (freeWords) {
    queries.unshift({ type: "point_of_interest", keyword: freeWords.slice(0, 80), need: selected[0] });
  }

  if (queries.length === 0) {
    queries.push({ type: "point_of_interest", keyword: "food", need: "Food" });
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
      Boolean(place?.name && place.geometry?.location && !excludeMatch(place.name || "", exclude)),
    )
    .map((place) => {
      // The query that found it is NOT evidence. Only the place's own types/text count.
      const { helpsWith, subChips } = classify({
        name: place.name,
        types: place.types,
        text: place.editorial_summary?.overview,
      });
      return { place, helpsWith, subChips };
    })
    .filter(({ helpsWith, subChips }) => passesNeedFilter({ helpsWith, subChips }, selected, subs))
    .map(({ place, helpsWith, subChips }) => {
      const primaryNeed = selected.find((need) => helpsWith.includes(need as NeedLabel)) || helpsWith[0];
      const hoursToday = todayHours(place.opening_hours?.weekday_text, place.opening_hours?.open_now);
      const hoursFull = (place.opening_hours?.weekday_text || []).join("\n");
      // Use every review Google already returned (up to 5) — no extra API calls.
      const reviews = place.reviews || [];
      const picked = pickQuote(reviews);
      const review = picked ? clipWords(picked.full, 280) : undefined;
      const highlights = extractHighlights(reviews.map((r) => r.text || ""), 5);

      return {
        id: place.placeId,
        name: place.name!,
        area: place.formatted_address || area,
        lat: place.geometry!.location.lat,
        lng: place.geometry!.location.lng,
        icon: iconForNeed(primaryNeed),
        helpsWith,
        subChips,
        description: compileBlurb(place),
        note: hoursToday || "Hours not listed — confirm before you go.",
        website: place.website || place.url,
        hours: hoursToday,
        hoursFull,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        reviewSnippet: review,
        quote: picked?.quote,
        highlights,
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
  reviews?: Array<{ text?: string; rating?: number }>;
  types?: string[];
};

async function fromOsm(
  area: string,
  needs: string[],
  exclude: string[],
  origin?: { lat: number; lng: number; radius?: number },
  extra?: string,
): Promise<NearbyPlace[]> {
  const subs = pickedSubChips(needs, (extra || "").split(","));
  const selected = needs.length > 0 ? needs : ["Sleep", "Food", "Fuel"];
  const center = centerFor(area, origin?.lat, origin?.lng, origin?.radius);
  const filters = tagsFor(needs, subs)
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

      const { helpsWith, subChips } = classify({ name, osmTags: tags, text: tags.description });
      if (!passesNeedFilter({ helpsWith, subChips }, selected, subs)) continue;

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
      const primary = selected.find((need) => helpsWith.includes(need as NeedLabel)) || helpsWith[0];

      mapped.push({
        id: `osm-${el.id}`,
        name,
        area: area || "Nearby",
        lat,
        lng,
        icon: iconForNeed(primary),
        helpsWith,
        subChips,
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
    const osm = await fromOsm(area, needs, exclude, origin, extra);
    if (osm.length > 0) {
      return NextResponse.json({
        places: osm,
        source: "openstreetmap",
        googleError: googleError || undefined,
      });
    }
  } catch {
    // nothing found — we never invent places
  }

  return NextResponse.json({
    places: [] as NearbyPlace[],
    source: "none",
    googleError: googleError || undefined,
  });
}
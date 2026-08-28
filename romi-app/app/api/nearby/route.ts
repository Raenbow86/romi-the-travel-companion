import { NextRequest, NextResponse } from "next/server";

type Center = { lat: number; lng: number; radius: number };

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
  Wine: ['["craft"="winery"]', '["shop"="wine"]'],
  "Wi‑Fi & Cell": ['["internet_access"="wlan"]'],
  "Dog Needs": ['["dog"="yes"]'],
  Power: ['["amenity"="charging_station"]'],
};

const ICONS: Record<string, string> = {
  Sleep: "🏕️",
  Food: "🍔",
  Fuel: "⛽",
  Water: "💧",
  Shower: "🚿",
  Laundry: "🧺",
  Adventure: "🏞️",
  Wine: "🍷",
  "Wi‑Fi & Cell": "📶",
  "Dog Needs": "🐾",
  Power: "⚡",
};

function centerFor(area: string): Center {
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

  const center = centerFor(area);
  const filters = tagsFor(needs)
    .map((tag) => `nwr${tag}(around:${center.radius},${center.lat},${center.lng});`)
    .join("\n");

  const query = `[out:json][timeout:18];\n(\n${filters}\n);\nout center 20;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json({ places: [], error: "nearby-unavailable" }, { status: 200 });
    }

    const data = (await response.json()) as {
      elements?: Array<{
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }>;
    };

    const places = (data.elements || [])
      .map((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        const name = el.tags?.name;
        if (!lat || !lng || !name) return null;
        if (exclude.some((ex) => name.toLowerCase().includes(ex) || ex.includes(name.toLowerCase()))) {
          return null;
        }

        const helpsWith = Object.entries(NEED_TAGS)
          .filter(([, tags]) =>
            tags.some((tag) => {
              const key = tag.match(/\["([^"]+)"/)?.[1];
              const val = tag.match(/"([^"]+)"\]/)?.[1];
              return key && val && el.tags?.[key] === val;
            }),
          )
          .map(([need]) => need);

        const primary = helpsWith[0] || "Adventure";
        return {
          id: `osm-${el.id}`,
          name,
          lat,
          lng,
          area: area || "Nearby",
          icon: ICONS[primary] || "📍",
          helpsWith,
          source: "openstreetmap",
          verified: false,
        };
      })
      .filter(Boolean)
      .slice(0, 12);

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [], error: "nearby-unavailable" }, { status: 200 });
  }
}

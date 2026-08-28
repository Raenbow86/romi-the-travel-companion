import { NextRequest, NextResponse } from "next/server";

type SearchPlace = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  icon: string;
};

function iconFor(types: string[] = []): string {
  if (types.includes("lodging") || types.includes("campground")) return "🛏️";
  if (types.includes("restaurant") || types.includes("cafe") || types.includes("bakery")) return "🍎";
  if (types.includes("gas_station")) return "⛽";
  if (
    types.some(
      (t) =>
        ["liquor_store", "bar", "night_club"].includes(t) ||
        t.includes("wine") ||
        t.includes("brew"),
    )
  )
    return "🍷";
  if (types.includes("park")) return "🏞️";
  return "📍";
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const radius = request.nextUrl.searchParams.get("radius") || "32000";
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || q.length < 2 || !lat || !lng) {
    return NextResponse.json({ places: [] as SearchPlace[] });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("keyword", q);
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radius);
    url.searchParams.set("key", key);

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) return NextResponse.json({ places: [] as SearchPlace[] });

    const data = (await response.json()) as {
      results?: Array<{
        place_id?: string;
        name?: string;
        vicinity?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        rating?: number;
        user_ratings_total?: number;
        types?: string[];
      }>;
    };

    const places: SearchPlace[] = (data.results || [])
      .filter((r) => r.name && r.geometry?.location)
      .slice(0, 8)
      .map((r) => ({
        id: r.place_id || `search-${r.name}`,
        name: r.name as string,
        area: r.vicinity || r.formatted_address || "",
        lat: r.geometry!.location!.lat,
        lng: r.geometry!.location!.lng,
        rating: r.rating,
        reviewCount: r.user_ratings_total,
        icon: iconFor(r.types),
      }));

    return NextResponse.json({ places, source: "google" });
  } catch {
    return NextResponse.json({ places: [] as SearchPlace[] });
  }
}

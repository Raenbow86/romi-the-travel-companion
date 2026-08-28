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

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || q.length < 3) {
    return NextResponse.json({ places: [] as SearchPlace[] });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", q);
    url.searchParams.set("key", key);

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ places: [] as SearchPlace[] });
    }

    const data = (await response.json()) as {
      results?: Array<{
        place_id?: string;
        name?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        rating?: number;
        user_ratings_total?: number;
        types?: string[];
      }>;
    };

    const places: SearchPlace[] = (data.results || [])
      .filter((r) => r.name && r.geometry?.location)
      .slice(0, 6)
      .map((r) => {
        const types = r.types || [];
        let icon = "📍";
        if (types.includes("lodging") || types.includes("campground")) icon = "🛏️";
        else if (types.includes("restaurant") || types.includes("cafe") || types.includes("bakery")) icon = "🍎";
        else if (types.includes("gas_station")) icon = "⛽";
        else if (types.some((t) => t.includes("wine") || t === "liquor_store")) icon = "🍷";
        else if (types.includes("park")) icon = "🏞️";
        return {
          id: r.place_id || `search-${r.name}`,
          name: r.name as string,
          area: r.formatted_address || "",
          lat: r.geometry!.location!.lat,
          lng: r.geometry!.location!.lng,
          rating: r.rating,
          reviewCount: r.user_ratings_total,
          icon,
        };
      });

    return NextResponse.json({ places, source: "google" });
  } catch {
    return NextResponse.json({ places: [] as SearchPlace[] });
  }
}

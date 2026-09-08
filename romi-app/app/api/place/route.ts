import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!key || !id) return NextResponse.json({ error: "missing" }, { status: 200 });

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", id);
  url.searchParams.set(
    "fields",
    "name,formatted_address,geometry,website,rating,user_ratings_total,types,opening_hours,reviews",
  );
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = (await response.json()) as {
      result?: {
        name?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        website?: string;
        rating?: number;
        user_ratings_total?: number;
        types?: string[];
        opening_hours?: { weekday_text?: string[]; open_now?: boolean };
        reviews?: Array<{ text?: string }>;
      };
    };
    const r = data.result;
    if (!r?.name || !r.geometry?.location) {
      return NextResponse.json({ error: "not-found" }, { status: 200 });
    }
    const week = r.opening_hours?.weekday_text || [];
    return NextResponse.json({
      place: {
        id,
        name: r.name,
        area: r.formatted_address || "",
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
        website: r.website,
        rating: r.rating,
        reviewCount: r.user_ratings_total,
        hours: week.slice(0, 2).join(" · "),
        hoursFull: week.join("\n"),
        icon: "📍",
        helpsWith: [],
        source: "google",
      },
    });
  } catch {
    return NextResponse.json({ error: "details-failed" }, { status: 200 });
  }
}

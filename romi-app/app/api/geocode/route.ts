import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 200 });

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("key", key);
  if (lat && lng) url.searchParams.set("latlng", `${lat},${lng}`);
  else if (q) url.searchParams.set("address", q);
  else return NextResponse.json({ error: "missing" }, { status: 200 });

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = (await response.json()) as {
      results?: Array<{
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
      }>;
    };
    const first = data.results?.[0];
    if (!first?.geometry?.location) {
      return NextResponse.json({ error: "not-found" }, { status: 200 });
    }
    return NextResponse.json({
      label: first.formatted_address || q,
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng,
    });
  } catch {
    return NextResponse.json({ error: "geocode-failed" }, { status: 200 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  try {
    if (lat && lng) {
      const nom = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json`,
        {
          headers: { "User-Agent": "RomiTravelCompanion/1.0" },
          cache: "no-store",
        },
      );
      const data = (await nom.json()) as {
        display_name?: string;
        address?: { city?: string; town?: string; village?: string; state?: string };
      };
      const city =
        data.address?.city || data.address?.town || data.address?.village;
      const label = city
        ? `${city}${data.address?.state ? `, ${data.address.state}` : ""}`
        : data.display_name || "Near you";
      return NextResponse.json({
        label,
        lat: Number(lat),
        lng: Number(lng),
      });
    }

    if (!q) return NextResponse.json({ error: "missing" }, { status: 200 });

    if (!key) return NextResponse.json({ error: "no-key" }, { status: 200 });

    const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
    url.searchParams.set("input", q);
    url.searchParams.set("inputtype", "textquery");
    url.searchParams.set("fields", "name,formatted_address,geometry");
    url.searchParams.set("key", key);

    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = (await response.json()) as {
      candidates?: Array<{
        name?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
      }>;
    };
    const first = data.candidates?.[0];
    if (!first?.geometry?.location) {
      return NextResponse.json({ error: "not-found" }, { status: 200 });
    }
    return NextResponse.json({
      label: first.formatted_address || first.name || q,
      lat: first.geometry.location.lat,
      lng: first.geometry.location.lng,
    });
  } catch {
    return NextResponse.json({ error: "geocode-failed" }, { status: 200 });
  }
}

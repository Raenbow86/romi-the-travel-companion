import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const radius = request.nextUrl.searchParams.get("radius") || "32000";
  const types = request.nextUrl.searchParams.get("types") || "establishment";
  if (!key || q.length < 2) return NextResponse.json({ predictions: [] });

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", q);
  url.searchParams.set("key", key);
  url.searchParams.set("types", types);
  if (lat && lng && types === "establishment") {
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radius);
    url.searchParams.set("strictbounds", "true");
  }

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = (await response.json()) as {
      predictions?: Array<{
        place_id: string;
        description: string;
        structured_formatting?: { main_text?: string; secondary_text?: string };
      }>;
    };
    return NextResponse.json({
      predictions: (data.predictions || []).slice(0, 6).map((p) => ({
        id: p.place_id,
        name: p.structured_formatting?.main_text || p.description,
        area: p.structured_formatting?.secondary_text || p.description,
      })),
    });
  } catch {
    return NextResponse.json({ predictions: [] });
  }
}

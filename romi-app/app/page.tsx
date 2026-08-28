"use client";

import { FormEvent, useEffect, useState } from "react";
import { RomiMap } from "./RomiMap";

const needs = [
  { icon: "🛏️", label: "Sleep", detail: "Campgrounds, cabins, and overnight options" },
  { icon: "💧", label: "Water", detail: "Potable-water refills and water stations" },
  { icon: "🚿", label: "Shower", detail: "Showers and clean-up stops" },
  { icon: "🍎", label: "Food", detail: "Groceries, meals, and road snacks" },
  { icon: "⛽", label: "Fuel", detail: "Gas, diesel, propane, and charging later" },
  { icon: "⚡", label: "Power", detail: "Hookups, outlets, and places to recharge" },
  { icon: "📶", label: "Wi‑Fi & Cell", detail: "Simple availability and useful signal info" },
  { icon: "🧺", label: "Laundry", detail: "Laundromats and campground laundry" },
  { icon: "🐾", label: "Dog Needs", detail: "Pet-friendly stops, supplies, and walks" },
  { icon: "🏔️", label: "Adventure", detail: "Trails, fishing, views, and local fun" },
  { icon: "🍷", label: "Adult-friendly", detail: "Wine, beer, liquor, bars, and wineries" },
];

const suggestedAreas = [
  "Lodgepole Campground, Colorado",
  "Gunnison, Colorado",
  "Almont, Colorado",
  "Paonia, Colorado",
  "Hotchkiss, Colorado",
];

const realStops = [
  {
    id: "lodgepole-campground",
    lat: 38.761633,
    lng: -106.662259,
    icon: "🏕️",
    name: "Lodgepole Campground",
    area: "near Almont / Gunnison, Colorado",
    region: "gunnison",
    description:
      "National Forest campground near Almont and Gunnison, Colorado. Overnight, water access, dogs on leash, and nearby adventure.",
    helpsWith: ["Sleep", "Water", "Adventure", "Dog Needs"],
    note: "Confirm current season, water, and fees before you go. Dogs are typically OK on a leash.",
  },
  {
    id: "three-rivers-resort",
    lat: 38.6639,
    lng: -106.8467,
    icon: "🏡",
    name: "Three Rivers Resort",
    area: "Almont, Colorado",
    region: "gunnison",
    description:
      "On the Taylor River in Almont: general store, Smokehouse restaurant, cabins, and a practical stop between Gunnison and Lodgepole.",
    helpsWith: ["Food", "Sleep", "Adventure"],
    note: "Store hours are often 7am–9pm. Confirm the Smokehouse and cabin availability before you count on them.",
  },
  {
    id: "the-powerstop",
    lat: 38.5516,
    lng: -106.9278,
    icon: "🍔",
    name: "The Powerstop",
    area: "Gunnison, Colorado",
    region: "gunnison",
    description:
      "Gas station on N Main with a real burger counter inside. Locals rave about the burgers. Fuel is usually a bit more expensive — you’re paying for the food stop too.",
    helpsWith: ["Food", "Fuel"],
    note: "905 N Main St, Gunnison. Burgers, wings, breakfast. Confirm hours (often about 7am–10pm). Fill up if you need to, but the burger is the reason to pull in.",
  },
  {
    id: "paonia-bread-works",
    lat: 38.8684,
    lng: -107.5924,
    icon: "🍞",
    name: "Paonia Bread Works",
    area: "Paonia, Colorado",
    region: "paonia",
    description:
      "Standout of the trip. Bread and food were extremely good. Go early — they close around 1.",
    helpsWith: ["Food"],
    note: "530 Grand Ave, Paonia. Typically 7am–1pm. Grab bread to go for later stops. Bring a backup payment.",
  },
  {
    id: "town-of-paonia",
    lat: 38.8683,
    lng: -107.5919,
    icon: "🏘️",
    name: "Paonia",
    area: "Paonia, Colorado",
    region: "paonia",
    description:
      "Walk Grand Avenue and use town as the morning and evening hub. The living room of this wine-country stretch, not just a pin.",
    helpsWith: ["Food", "Wi‑Fi & Cell"],
    note: "Park once and walk. Peak late spring through harvest.",
  },
  {
    id: "orchard-valley-farms",
    lat: 38.8568,
    lng: -107.5985,
    icon: "🍑",
    name: "Orchard Valley Farms & Market",
    area: "Paonia, Colorado",
    region: "paonia",
    description:
      "Orchard, farm market, and wine in one stop, with a river picnic if you want it.",
    helpsWith: ["Food", "Adult-friendly", "Dog Needs"],
    note: "15836 Black Bridge Rd. In season often 10am–6pm, Memorial Day through Halloween. Dog-friendly park area. Bring a box for u-pick.",
  },
  {
    id: "storm-cellar",
    lat: 38.7688,
    lng: -107.6946,
    icon: "🍷",
    name: "The Storm Cellar",
    area: "Hotchkiss, Colorado",
    region: "paonia",
    description:
      "High-elevation tasting room with a wow view. Makes the wine-country day feel special.",
    helpsWith: ["Adult-friendly", "Adventure"],
    note: "14139 Runzel Gulch Rd. Often Thu–Sun, noon–7pm, Memorial Day through late October. Gravel road with two sharp switchbacks. Slow for big rigs.",
  },
  {
    id: "big-bs",
    lat: 38.8275,
    lng: -107.6958,
    icon: "🍎",
    name: "Big B’s Delicious Orchards",
    area: "Hotchkiss, Colorado",
    region: "paonia",
    description:
      "Orchard, cafe, cider, and campground on Hwy 133. Easy lunch between wineries. Dogs welcome.",
    helpsWith: ["Food", "Adult-friendly", "Dog Needs", "Sleep", "Wi‑Fi & Cell"],
    note: "39126 Hwy 133. Open about April–November. Courtyard has WiFi. Optional overnight if you want orchard quiet.",
  },
  {
    id: "farm-runners",
    lat: 38.8004,
    lng: -107.7176,
    icon: "🥬",
    name: "Farm Runners Station",
    area: "Hotchkiss, Colorado",
    region: "paonia",
    description:
      "Farm market and cafe for Western Slope food. Stock the cooler, not just browse.",
    helpsWith: ["Food"],
    note: "235 Hwy 133, next to City Market. Confirm hours. Year-round local food.",
  },
  {
    id: "mesa-winds",
    lat: 38.8529,
    lng: -107.7718,
    icon: "🍇",
    name: "Mesa Winds Farm & Winery",
    area: "Hotchkiss, Colorado",
    region: "paonia",
    description:
      "The wine stop that made a traveler want to make fruit wine. A destination, not a five-minute pour.",
    helpsWith: ["Adult-friendly", "Food", "Adventure"],
    note: "31262 L Rd. Seasonal; often evenings Wed–Sat and Sunday brunch. Call first. Go when the kitchen is open.",
  },
  {
    id: "pickin-in-the-park",
    lat: 38.8694,
    lng: -107.5952,
    icon: "🎵",
    name: "Pickin’ in the Park",
    area: "Paonia, Colorado",
    region: "paonia",
    description:
      "Free Thursday-night concerts in Paonia Town Park in August. Turns tasting rooms into an evening in town.",
    helpsWith: ["Adventure", "Food"],
    note: "Music from 6pm in August. Bring a chair or blanket. Arrive before 6 for a good spot.",
  },
  {
    id: "curecanti-pine-point",
    lat: 38.4536,
    lng: -107.3482,
    icon: "🏞️",
    name: "Curecanti — Pine Point",
    area: "Curecanti National Recreation Area",
    region: "paonia",
    description:
      "Scenic stop where a real traveler walked all the way down along the reservoir / river. Breaks the food-and-wine loop with landscape.",
    helpsWith: ["Adventure", "Dog Needs"],
    note: "Pine Creek Trailhead off US-50. Pets on leash. Bring water — the climb back up is the workout. Confirm trailhead access.",
  },
  {
    id: "cedaredge",
    lat: 38.9014,
    lng: -107.9263,
    icon: "🌲",
    name: "Cedaredge",
    area: "Cedaredge, Colorado",
    region: "paonia",
    description:
      "Confirmed town on the same trip, toward Grand Mesa. Exact in-town stop still TBD — kept as a pin until more detail lands.",
    helpsWith: ["Food", "Adventure"],
    note: "Western extension of the Paonia stretch. Applefest in October. Tell ROMI the exact stop when you remember it.",
  },
];

type Screen = "home" | "report" | "saved";

type SavedDay = {
  id: string;
  name: string;
  location: string;
  needs: string[];
  placeIds: string[];
};

type NearbyPlace = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  icon: string;
  helpsWith: string[];
  description?: string;
  note?: string;
  website?: string;
  hours?: string;
  hoursFull?: string;
  rating?: number;
  reviewCount?: number;
  reviewSnippet?: string;
  source?: string;
};

type TravelerReport = {
  name: string;
  area: string;
  helpsWith: string[];
  dogFriendly: string;
  shade: string;
  wifi: string;
  vibe: string;
  notes: string;
  returnAgain: string;
};

type Origin = { label: string; lat: number; lng: number };

function compactName(value: string) {
  return value
    .toLowerCase()
    .replace(/[''`´]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^the/, "");
}

function isSamePlace(a: string, b: string) {
  const ca = compactName(a);
  const cb = compactName(b);
  if (!ca || !cb) return false;
  return ca === cb || ca.includes(cb) || cb.includes(ca);
}

function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [locationDraft, setLocationDraft] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");
  const [briefDraft, setBriefDraft] = useState("");
  const [refinements, setRefinements] = useState<string[]>([]);
  const [romiReply, setRomiReply] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; area: string }>>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [searchPlaces, setSearchPlaces] = useState<NearbyPlace[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nearbyStatus, setNearbyStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [geoStatus, setGeoStatus] = useState("");

  const [travelerReports, setTravelerReports] = useState<TravelerReport[]>([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [savedDays, setSavedDays] = useState<SavedDay[]>([]);
  const [flaggedPlaces, setFlaggedPlaces] = useState<Array<{ id: string; name: string; needs: string[] }>>([]);
  const [scoutPoints, setScoutPoints] = useState(0);
  const [viewingSavedDay, setViewingSavedDay] = useState<SavedDay | null>(null);
  const [dayName, setDayName] = useState("");

  const [reportName, setReportName] = useState("");
  const [reportArea, setReportArea] = useState("");
  const [reportNeeds, setReportNeeds] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState("");
  const [returnAgain, setReturnAgain] = useState("");
  const [radiusMiles, setRadiusMiles] = useState(15);
  const radiusMeters = Math.round(radiusMiles * 1609);

  useEffect(() => {
    try {
      const savedReports = window.localStorage.getItem("romi-traveler-reports");
      if (savedReports) {
        const parsed = JSON.parse(savedReports);
        if (Array.isArray(parsed)) setTravelerReports(parsed);
      }
      const savedPlaces = window.localStorage.getItem("romi-saved-places");
      if (savedPlaces) {
        const parsed = JSON.parse(savedPlaces);
        if (Array.isArray(parsed)) setSavedPlaceIds(parsed);
      }
      const savedDayRaw = window.localStorage.getItem("romi-saved-days");
      if (savedDayRaw) {
        const parsed = JSON.parse(savedDayRaw);
        if (Array.isArray(parsed)) setSavedDays(parsed);
      }
      const pointsRaw = window.localStorage.getItem("romi-scout-points");
      if (pointsRaw) {
        const n = Number(pointsRaw);
        if (!Number.isNaN(n)) setScoutPoints(n);
      }
      const flagsRaw = window.localStorage.getItem("romi-flagged-places");
      if (flagsRaw) {
        const parsed = JSON.parse(flagsRaw);
        if (Array.isArray(parsed)) setFlaggedPlaces(parsed);
      }
      const originRaw = window.localStorage.getItem("romi-origin");
      if (originRaw) {
        const parsed = JSON.parse(originRaw) as Origin;
        if (parsed?.lat && parsed?.lng) {
          setOrigin(parsed);
          setLocationDraft(parsed.label);
        }
      }
    } catch {
      // ignore
    }
    setHasLoadedReports(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedReports) return;
    try {
      window.localStorage.setItem("romi-traveler-reports", JSON.stringify(travelerReports));
      window.localStorage.setItem("romi-saved-places", JSON.stringify(savedPlaceIds));
      window.localStorage.setItem("romi-saved-days", JSON.stringify(savedDays));
      window.localStorage.setItem("romi-scout-points", String(scoutPoints));
      window.localStorage.setItem("romi-flagged-places", JSON.stringify(flaggedPlaces));
      if (origin) window.localStorage.setItem("romi-origin", JSON.stringify(origin));
    } catch {
      // ignore
    }
  }, [travelerReports, savedPlaceIds, savedDays, scoutPoints, origin, flaggedPlaces, hasLoadedReports]);

  useEffect(() => {
    if (!origin) {
      setNearbyPlaces([]);
      return;
    }
    let cancelled = false;
    setNearbyStatus("loading");
    const params = new URLSearchParams({
      area: origin.label,
      needs: selectedNeeds.join(","),
      lat: String(origin.lat),
      lng: String(origin.lng),
      radius: String(radiusMeters),
      exclude: realStops.map((s) => s.name).join("|"),
    });
    if (refinements.length) params.set("extra", refinements.join(" "));
    fetch(`/api/nearby?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { places?: NearbyPlace[] }) => {
        if (!cancelled) {
          setNearbyPlaces(data.places || []);
          setNearbyStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNearbyPlaces([]);
          setNearbyStatus("ready");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [origin, selectedNeeds, refinements, radiusMiles]);

  useEffect(() => {
    if (!origin || placeSearch.trim().length < 2) {
      setSuggestions([]);
      setSearchPlaces([]);
      return;
    }
    const q = placeSearch.trim();
    const timer = window.setTimeout(() => {
      fetch(
        `/api/autocomplete?q=${encodeURIComponent(q)}&lat=${origin.lat}&lng=${origin.lng}&radius=${radiusMeters}`,
      )
        .then((r) => r.json())
        .then((data: { predictions?: Array<{ id: string; name: string; area: string }> }) => {
          setSuggestions(data.predictions || []);
        })
        .catch(() => setSuggestions([]));

      fetch(
        `/api/search?q=${encodeURIComponent(q)}&lat=${origin.lat}&lng=${origin.lng}&radius=${radiusMeters}`,
      )
        .then((r) => r.json())
        .then((data: { places?: NearbyPlace[] }) => {
          setSearchPlaces(data.places || []);
        })
        .catch(() => setSearchPlaces([]));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [placeSearch, origin]);

  function matchingNeeds(placeNeeds: string[]) {
    return selectedNeeds.filter((need) => placeNeeds.includes(need));
  }

  function inRadius(stop: { lat: number; lng: number }) {
    if (!origin) return false;
    return milesBetween(origin, stop) <= radiusMiles;
  }

  function verifiedHere() {
    if (!origin) return [];
    return realStops
      .filter((stop) => inRadius(stop))
      .filter((stop) =>
        selectedNeeds.length === 0
          ? true
          : matchingNeeds(stop.helpsWith).length > 0,
      )
      .sort((a, b) => matchingNeeds(b.helpsWith).length - matchingNeeds(a.helpsWith).length);
  }

  function googleLeads() {
    const pool = placeSearch.trim().length >= 2 ? searchPlaces : nearbyPlaces;
    const flagged = new Set(flaggedPlaces.map((f) => f.id));
    return pool
      .filter((place) => !flagged.has(place.id))
      .filter((place) => !realStops.some((stop) => isSamePlace(stop.name, place.name)))
      .filter((place) => inRadius(place))
      .filter((place) => {
        if (selectedNeeds.length === 0 || !place.helpsWith?.length) return true;
        return place.helpsWith.some((need) => selectedNeeds.includes(need));
      })
      .sort((a, b) => {
        const blob = (place: NearbyPlace) =>
          `${place.name} ${place.description || ""} ${place.area}`.toLowerCase();
        const score = (place: NearbyPlace) =>
          refinements.filter((item) => blob(place).includes(item.toLowerCase())).length;
        return score(b) - score(a);
      })
      .slice(0, 8);
  }

  function allCards() {
    if (viewingSavedDay?.placeIds.length) {
      return realStops.filter((s) => viewingSavedDay.placeIds.includes(s.id));
    }
    return [
      ...verifiedHere().map((s) => ({ ...s, status: "verified" as const })),
      ...googleLeads().map((s) => ({ ...s, status: "google" as const })),
    ];
  }

  function mapStops() {
    return allCards()
      .filter((s) => typeof s.lat === "number")
      .map((s) => ({
        id: s.id,
        name: s.name,
        area: s.area,
        icon: s.icon,
        lat: s.lat,
        lng: s.lng,
        kind: "status" in s && s.status === "google" ? ("google" as const) : ("verified" as const),
      }));
  }

  function selectedCard() {
    return allCards().find((s) => s.id === highlightedId) || null;
  }

  async function applyOrigin(label: string, lat: number, lng: number) {
    const next = { label, lat, lng };
    setOrigin(next);
    setLocationDraft(label);
    setViewingSavedDay(null);
    setHighlightedId(null);
    setExpandedId(null);
  }

  async function geocodeDraft(event?: FormEvent) {
    event?.preventDefault();
    const q = locationDraft.trim();
    if (!q) return;
    setGeoStatus("Finding that area…");
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.lat) {
      await applyOrigin(data.label || q, data.lat, data.lng);
      setGeoStatus("");
    } else {
      setGeoStatus("Couldn’t find that place. Try a city name.");
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("This browser won’t share location.");
      return;
    }
    setGeoStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
        const data = await res.json();
        await applyOrigin(data.label || "Near you", latitude, longitude);
        setGeoStatus("");
      },
      () => setGeoStatus("Location was blocked. Type a city instead."),
    );
  }

  async function pickSuggestion(id: string, name: string) {
    setPlaceSearch(name);
    setSuggestions([]);
    const res = await fetch(`/api/place?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (data.place) {
      setSearchPlaces((current) => {
        const next = current.filter((p) => p.id !== data.place.id);
        return [data.place, ...next];
      });
      setHighlightedId(data.place.id);
      setExpandedId(data.place.id);
    }
  }

  function toggleNeed(label: string) {
    setSelectedNeeds((current) =>
      current.includes(label) ? current.filter((n) => n !== label) : [...current, label],
    );
  }

  function addRefinement(text: string) {
    const chip = text.trim().replace(/\s+/g, " ");
    if (!chip) return;
    setRefinements((current) =>
      current.some((item) => item.toLowerCase() === chip.toLowerCase())
        ? current
        : [...current, chip],
    );
  }

  function talkToRomi(event?: FormEvent) {
    event?.preventDefault();
    const text = briefDraft.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    const synonyms: Array<{ need: string; words: string[] }> = [
      { need: "Adult-friendly", words: ["adult", "drink", "bar", "beer", "wine", "brewery", "winery", "cocktail", "liquor", "golf cart"] },
      { need: "Adventure", words: ["adventure", "hike", "trail", "fish", "atv", "jeep", "raft", "hot spring"] },
      { need: "Food", words: ["food", "eat", "dinner", "lunch", "breakfast", "hungry"] },
      { need: "Fuel", words: ["fuel", "gas", "diesel"] },
      { need: "Sleep", words: ["sleep", "camp", "stay", "overnight"] },
      { need: "Shower", words: ["shower"] },
      { need: "Dog Needs", words: ["dog", "pup"] },
    ];
    const found = synonyms.filter((row) => row.words.some((word) => lower.includes(word))).map((row) => row.need);
    if (found.length) {
      setSelectedNeeds((current) => [...new Set([...current, ...found])]);
    }
    addRefinement(text);
    const where = origin?.label.split(",")[0] || "this area";
    setRomiReply(
      `Got it — ${found.length ? found.join(" + ") : "that"} around ${where}${
        /golf cart/i.test(text) ? ", leaning golf-cart fun" : ""
      }. Keep talking and I’ll tighten the pins.`,
    );
    setBriefDraft("");
  }

  function startPlaceReport(prefill?: { name?: string; area?: string }) {
    setReportName(prefill?.name || "");
    setReportArea(prefill?.area || origin?.label || "");
    setReportNeeds(selectedNeeds);
    setReportNotes("");
    setReturnAgain("");
    setScreen("report");
  }

  function savePlaceReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reportName.trim() || !reportArea.trim()) return;
    const newReport: TravelerReport = {
      name: reportName.trim(),
      area: reportArea.trim(),
      helpsWith: reportNeeds,
      dogFriendly: "",
      shade: "",
      wifi: "",
      vibe: "",
      notes: reportNotes.trim(),
      returnAgain,
    };
    setTravelerReports((current) => [newReport, ...current]);
    setScoutPoints((n) => n + 10 + (newReport.notes ? 10 : 0));
    setScreen("home");
  }

  function saveThisDay() {
    if (!origin) return;
    const name = dayName.trim() || `${origin.label.split(",")[0]} day`;
    const placeIds = verifiedHere().map((s) => s.id);
    setSavedDays((current) => [
      {
        id: `${Date.now()}`,
        name,
        location: origin.label,
        needs: selectedNeeds,
        placeIds,
      },
      ...current.filter((d) => d.name !== name),
    ]);
  }

  function openDay(day: SavedDay) {
    setViewingSavedDay(day);
    setSelectedNeeds(day.needs);
    setDayName(day.name);
    setScreen("home");
    const match = realStops.find((s) => day.placeIds.includes(s.id));
    if (match) applyOrigin(day.location, match.lat, match.lng);
  }

  function Nav() {
    const items: Array<{ id: Screen; label: string }> = [
      { id: "home", label: "Explore" },
      { id: "saved", label: "Plans" },
      { id: "report", label: "Scouts" },
    ];
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-amber-100 bg-white/95 px-2 py-2">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "home") setViewingSavedDay(null);
                setScreen(item.id);
              }}
              className={`rounded-2xl px-2 py-2 text-xs font-bold ${
                screen === item.id ? "bg-teal-700 text-white" : "text-slate-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  function renderCard(place: {
    id: string;
    name: string;
    area: string;
    icon: string;
    lat: number;
    lng: number;
    helpsWith?: string[];
    description?: string;
    note?: string;
    rating?: number;
    reviewCount?: number;
    reviewSnippet?: string;
    website?: string;
    hours?: string;
    hoursFull?: string;
    status?: "verified" | "google";
  }) {
    const status = place.status || "verified";
    const matches = matchingNeeds(place.helpsWith || []);
    const saved = savedPlaceIds.includes(place.id);
    const open = expandedId === place.id;
    return (
      <article
        key={place.id}
        id={`place-${place.id}`}
        onClick={() => {
          setHighlightedId(place.id);
          setExpandedId(open ? null : place.id);
        }}
        className={`cursor-pointer rounded-3xl bg-white p-4 shadow-sm ring-1 ${
          highlightedId === place.id ? "ring-2 ring-orange-500" : "ring-amber-100"
        }`}
      >
        <div className="flex gap-3">
          <span className="text-3xl">{place.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
              {status === "verified" ? "SCOUT VERIFIED" : "GOOGLE · NEEDS A SCOUT"}
            </p>
            <h4 className="mt-1 text-lg font-black leading-6 text-slate-900">{place.name}</h4>
            <p className="text-xs font-semibold text-slate-500">📍 {place.area}</p>
          </div>
        </div>
        {(place.rating || place.hours) && (
          <p className="mt-2 text-sm font-bold text-teal-800">
            {place.rating ? `★ ${place.rating}${place.reviewCount ? ` (${place.reviewCount})` : ""}` : ""}
            {place.rating && place.hours ? " · " : ""}
            {place.hours ? `🕒 ${place.hours}` : ""}
          </p>
        )}
        {place.helpsWith && place.helpsWith.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {place.helpsWith.map((need) => (
              <span
                key={need}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  matches.includes(need) ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {need}
              </span>
            ))}
          </div>
        )}
        {place.description ? (
          <p className={`mt-3 text-sm leading-6 text-slate-600 ${open ? "" : "line-clamp-3"}`}>
            {place.description}
          </p>
        ) : null}
        {status === "verified" && place.note ? (
          <p className={`mt-2 text-sm font-semibold text-teal-800 ${open ? "" : "line-clamp-2"}`}>
            🧭 {place.note}
          </p>
        ) : null}
        {open && place.reviewSnippet ? (
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-slate-700">
            “{place.reviewSnippet}”
          </p>
        ) : null}
        {open && place.hoursFull ? (
          <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{place.hoursFull}</p>
        ) : null}
        {open && place.website ? (
          <a
            href={place.website}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-3 block text-sm font-bold text-teal-700"
          >
            Website →
          </a>
        ) : null}
        <p className="mt-3 text-sm font-bold text-orange-700">
          {open ? "Show less" : "Read more"}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {status === "verified" ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSavedPlaceIds((cur) =>
                  cur.includes(place.id) ? cur.filter((id) => id !== place.id) : [...cur, place.id],
                );
              }}
              className={`rounded-full px-4 py-3 text-sm font-bold ${
                saved ? "border border-teal-700 bg-white text-teal-700" : "bg-orange-600 text-white"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                startPlaceReport({ name: place.name, area: place.area });
              }}
              className="rounded-full bg-orange-600 px-4 py-3 text-sm font-bold text-white"
            >
              Scout it
            </button>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full border border-teal-700 px-4 py-3 text-center text-sm font-bold text-teal-700"
          >
            Maps
          </a>
        </div>
        {status === "google" ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setFlaggedPlaces((current) =>
                current.some((f) => f.id === place.id)
                  ? current
                  : [
                      {
                        id: place.id,
                        name: place.name,
                        needs: selectedNeeds,
                      },
                      ...current,
                    ],
              );
              if (highlightedId === place.id) setHighlightedId(null);
            }}
            className="mt-2 w-full rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-500"
          >
            Doesn’t belong in this list
          </button>
        ) : null}
      </article>
    );
  }

  if (screen === "report") {
    return (
      <main className="min-h-screen bg-amber-50 px-5 py-8 pb-28 text-slate-800">
        <section className="mx-auto max-w-md">
          <button type="button" onClick={() => setScreen("home")} className="text-sm font-bold text-teal-700">
            ← Explore
          </button>
          <h1 className="mt-6 text-4xl font-black">Your scouts</h1>
          <p className="mt-2 text-2xl font-black text-teal-800">{scoutPoints} pts</p>
          {travelerReports.map((report, i) => (
            <article key={`${report.name}-${i}`} className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-teal-700">YOUR SCOUT REPORT</p>
              <h3 className="font-black">{report.name}</h3>
              <p className="text-sm text-slate-500">📍 {report.area}</p>
            </article>
          ))}
          {flaggedPlaces.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-black">Flagged as wrong</h2>
              <p className="mt-1 text-sm text-slate-600">
                Hidden from Explore. Undo if you tapped by mistake.
              </p>
              {flaggedPlaces.map((flag) => (
                <article key={flag.id} className="mt-3 rounded-3xl bg-white p-4 shadow-sm">
                  <h3 className="font-black">{flag.name}</h3>
                  <p className="text-sm text-slate-500">
                    {flag.needs.length ? flag.needs.join(" + ") : "Doesn’t belong"}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFlaggedPlaces((current) => current.filter((f) => f.id !== flag.id))
                    }
                    className="mt-2 text-sm font-bold text-teal-700"
                  >
                    Undo flag
                  </button>
                </article>
              ))}
            </section>
          )}
          <form onSubmit={savePlaceReport} className="mt-8 space-y-4">
            <h2 className="text-xl font-black">Add a report</h2>
            <input
              required
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Place name"
              className="w-full rounded-2xl border border-amber-200 px-4 py-3"
            />
            <input
              required
              value={reportArea}
              onChange={(e) => setReportArea(e.target.value)}
              placeholder="Town / area"
              className="w-full rounded-2xl border border-amber-200 px-4 py-3"
            />
            <textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="What was it actually like?"
              className="h-28 w-full rounded-2xl border border-amber-200 px-4 py-3"
            />
            <button className="w-full rounded-full bg-orange-600 py-4 font-bold text-white">Save report</button>
          </form>
        </section>
        <Nav />
      </main>
    );
  }

  if (screen === "saved") {
    return (
      <main className="min-h-screen bg-amber-50 px-5 py-8 pb-28 text-slate-800">
        <section className="mx-auto max-w-md">
          <h1 className="text-4xl font-black">Your plans</h1>
          <p className="mt-2 text-slate-600">Open a saved day. You’ll only see that plan.</p>
          {savedDays.length === 0 ? (
            <p className="mt-8 rounded-3xl bg-white p-5 text-sm text-slate-600">No plans yet — save one from Explore.</p>
          ) : (
            <div className="mt-8 space-y-3">
              {savedDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => openDay(day)}
                  className="w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-amber-100"
                >
                  <p className="text-lg font-black">{day.name}</p>
                  <p className="text-sm text-slate-500">
                    📍 {day.location}
                    {day.needs.length ? ` · ${day.needs.join(" + ")}` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
        <Nav />
      </main>
    );
  }

  const picked = selectedCard();

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-8 pb-28 text-slate-800">
      <section className="mx-auto max-w-md">
        <p className="text-sm font-bold tracking-[0.22em] text-teal-700">ROMI</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
          {viewingSavedDay ? viewingSavedDay.name : "Find the next stop"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          One screen: where you are, what you need, a map, then the card.
        </p>

        {!viewingSavedDay && (
          <form onSubmit={geocodeDraft} className="mt-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">WHERE</p>
            <div className="mt-2 flex gap-2">
              <input
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                placeholder="City, campground, or address"
                className="min-w-0 flex-1 rounded-2xl border border-amber-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button type="submit" className="rounded-2xl bg-teal-700 px-4 font-bold text-white">
                Go
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={useMyLocation}
                className="rounded-full bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700"
              >
                Use my location
              </button>
              {["Paonia, Colorado", "Gunnison, Colorado", "Salida, CO 81201", "Colorado Springs, Colorado"].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => {
                    setLocationDraft(area);
                    void (async () => {
                      const res = await fetch(`/api/geocode?q=${encodeURIComponent(area)}`);
                      const data = await res.json();
                      if (data.lat) applyOrigin(data.label || area, data.lat, data.lng);
                    })();
                  }}
                  className="rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
                >
                  {area.split(",")[0]}
                </button>
              ))}
            </div>
            {geoStatus ? <p className="mt-2 text-sm text-slate-500">{geoStatus}</p> : null}
            {origin ? (
              <div className="mt-3">
                <p className="text-sm font-semibold text-teal-800">
                  Within {radiusMiles} miles of {origin.label.split(",")[0]}
                </p>
                <div className="mt-2 flex gap-2">
                  {[10, 15, 20].map((miles) => (
                    <button
                      key={miles}
                      type="button"
                      onClick={() => setRadiusMiles(miles)}
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        radiusMiles === miles ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-800"
                      }`}
                    >
                      {miles} mi
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </form>
        )}

        {!viewingSavedDay && origin && (
          <form onSubmit={talkToRomi} className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">TELL ROMI</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Get more specific</h3>
            <p className="mt-1 text-sm text-slate-600">
              Talk like you would to a friend. “Adventure and adult-friendly, but golf carts.”
            </p>
            <textarea
              value={briefDraft}
              onChange={(event) => setBriefDraft(event.target.value)}
              placeholder="I want adventure and drinks, like golf-cart bars…"
              className="mt-3 h-24 w-full rounded-2xl border border-amber-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button type="submit" className="mt-3 w-full rounded-full bg-teal-700 py-3 font-bold text-white">
              Tell Romi
            </button>
            {romiReply ? (
              <p className="mt-3 rounded-2xl bg-teal-50 p-3 text-sm font-semibold text-teal-900">
                {romiReply}
              </p>
            ) : null}
            {refinements.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {refinements.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRefinements((current) => current.filter((r) => r !== item))}
                    className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-800"
                  >
                    {item} ×
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {!viewingSavedDay && (
          <section className="mt-5">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">FILTERS</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {needs.map((need) => {
                const on = selectedNeeds.includes(need.label);
                return (
                  <button
                    key={need.label}
                    type="button"
                    onClick={() => toggleNeed(need.label)}
                    className={`rounded-full px-3 py-2 text-sm font-bold ${
                      on ? "bg-orange-500 text-white" : "bg-white text-slate-700 ring-1 ring-amber-100"
                    }`}
                  >
                    {need.icon} {need.label}
                  </button>
                );
              })}
            </div>
            {selectedNeeds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    selectedNeeds.includes("Adult-friendly")
                      ? ["Golf carts", "Brewery", "Winery", "Cocktails", "Patio"]
                      : [],
                    selectedNeeds.includes("Adventure")
                      ? ["Hike", "Fish", "View", "Hot springs", "ATV"]
                      : [],
                    selectedNeeds.includes("Dog Needs")
                      ? ["Dog park", "Vet", "Supplies", "Pet-friendly patio", "Off-leash"]
                      : [],
                  ] as string[][]
                )
                  .flat()
                  .map((detail) => {
                    const on = refinements.some((item) => item.toLowerCase() === detail.toLowerCase());
                    return (
                      <button
                        key={detail}
                        type="button"
                        onClick={() =>
                          on
                            ? setRefinements((current) =>
                                current.filter((item) => item.toLowerCase() !== detail.toLowerCase()),
                              )
                            : addRefinement(detail)
                        }
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          on ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-800"
                        }`}
                      >
                        {detail}
                      </button>
                    );
                  })}
              </div>
            )}
          </section>
        )}

        {!viewingSavedDay && origin && (
          <section className="relative mt-5">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">SEARCH THIS AREA</p>
            <input
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              placeholder="McD, Powerstop, Big B’s…"
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-amber-100">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickSuggestion(s.id, s.name)}
                    className="block w-full border-b border-amber-50 px-4 py-3 text-left last:border-0"
                  >
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.area}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-5">
          <RomiMap
            compact
            stops={mapStops()}
            onSelect={(id) => {
              setHighlightedId(id);
              setExpandedId(id);
              window.setTimeout(() => {
                document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 50);
            }}
          />
        </div>

        {picked ? <div className="mt-4">{renderCard(picked)}</div> : null}

        <section className="mt-6 space-y-3">
          <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
            {nearbyStatus === "loading" ? "LOOKING AROUND…" : "IN THIS RADIUS"}
          </p>
          {allCards()
            .filter((c) => c.id !== picked?.id)
            .map((c) => renderCard(c))}
          {origin && allCards().length === 0 && nearbyStatus !== "loading" ? (
            <p className="rounded-3xl bg-white p-5 text-sm text-slate-600">
              Nothing matched those filters in this radius. Clear a filter or move the location.
            </p>
          ) : null}
        </section>

        {origin && !viewingSavedDay && (
          <section className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 p-5">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">SAVE THIS DAY</p>
            <input
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              placeholder={`${origin.label.split(",")[0]} day`}
              className="mt-3 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3"
            />
            <button
              type="button"
              onClick={saveThisDay}
              className="mt-3 w-full rounded-full bg-orange-600 py-3 font-bold text-white"
            >
              Save this plan
            </button>
          </section>
        )}
      </section>
      <Nav />
    </main>
  );
}

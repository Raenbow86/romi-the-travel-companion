import { NEEDS } from "@/lib/needs";

export const needs = NEEDS.map((n) => ({ icon: n.icon, label: n.label as string, detail: n.detail }));

export const realStops = [
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

export type Screen = "home" | "report" | "saved";

export type SavedDay = {
  id: string;
  name: string;
  location: string;
  needs: string[];
  placeIds: string[];
};

export type NearbyPlace = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  icon: string;
  helpsWith: string[];
  subChips?: string[];
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

export type TravelerReport = {
  id: string;
  name: string;
  area: string;
  helpsWith: string[];
  beenThere: string;
  pullThrough: string;
  dogFriendly: string;
  hoursSeen: string;
  shade: string;
  wifi: string;
  vibe: string;
  notes: string;
  returnAgain: string;
  status: "pending";
  points: number;
};

export type Origin = { label: string; lat: number; lng: number };

export type PlaceReview = {
  id: string;
  placeId: string;
  placeName: string;
  stars: number;
  text: string;
  at: number;
};

export type ReverifyAsk = {
  id: string;
  placeId: string;
  placeName: string;
  reason: string;
  status: "for-angela" | "sent-to-scouts" | "keep";
  at: number;
};

export function compactName(value: string) {
  return value
    .toLowerCase()
    .replace(/[''`´]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^the/, "");
}

export function isSamePlace(a: string, b: string) {
  const ca = compactName(a);
  const cb = compactName(b);
  if (!ca || !cb) return false;
  return ca === cb || ca.includes(cb) || cb.includes(ca);
}

export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
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

export type CardPlace = {
  id: string;
  name: string;
  area: string;
  icon: string;
  lat: number;
  lng: number;
  helpsWith?: string[];
  subChips?: string[];
  description?: string;
  note?: string;
  rating?: number;
  reviewCount?: number;
  reviewSnippet?: string;
  website?: string;
  hours?: string;
  hoursFull?: string;
  status?: "verified" | "google";
};

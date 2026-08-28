"use client";

import { useEffect, useMemo, useState } from "react";

type Need =
  | "sleep"
  | "food"
  | "dogs"
  | "connectivity"
  | "wine"
  | "scenic"
  | "event"
  | "market"
  | "bathroom";
type Rating = "must-do" | "really-good" | "confirmed";
type Place = {
  id: string;
  name: string;
  town: string;
  address: string;
  type: string;
  needs: Need[];
  hours: string;
  seasonal: string;
  dogFriendly: string;
  timeToSpend: string;
  phone?: string;
  website?: string;
  tips: string;
  why: string;
  rating: Rating;
  notes?: string;
};
type Plan = { id: string; name: string; placeIds: string[] };
type Tab = "today" | "search" | "saved" | "plans";

const NEED_LABELS: Record<Need, string> = {
  sleep: "Sleep",
  food: "Food",
  dogs: "Dogs",
  connectivity: "Signal",
  wine: "Wine",
  scenic: "Scenic",
  event: "Event",
  market: "Market",
  bathroom: "Bathroom",
};

const places: Place[] = [
  {
    id: "paonia-bread-works",
    name: "Paonia Bread Works",
    town: "Paonia, CO",
    address: "530 Grand Ave, Paonia, CO 81428",
    type: "Bakery / cafe",
    needs: ["food"],
    hours: "Typically 7:00am–1:00pm daily — they close early",
    seasonal: "Year-round",
    dogFriendly: "Patio often dog-friendly; indoor varies",
    timeToSpend: "30–60 minutes",
    phone: "970-527-5376",
    website: "https://paoniabreadworks.com",
    tips: "Go early. Bring a backup payment. Grab bread to go for later stops.",
    why: "A generic list misses this. Real travelers do not. Anchors a wine-country morning.",
    rating: "must-do",
    notes: "Standout of the trip. Bread and food were extremely good.",
  },
  {
    id: "town-of-paonia",
    name: "Paonia",
    town: "Paonia, CO",
    address: "Grand Avenue, Paonia, CO 81428",
    type: "Town / creative district",
    needs: ["food", "connectivity"],
    hours: "Walkable anytime; shops mostly daytime",
    seasonal: "Peak late spring through harvest (Aug–Oct)",
    dogFriendly: "Sidewalks and parks generally yes",
    timeToSpend: "30–90 minutes",
    tips: "Park once and walk Grand Avenue. Use town as morning and evening hub.",
    why: "The living room of the itinerary, not just a pin.",
    rating: "confirmed",
  },
  {
    id: "orchard-valley-farms",
    name: "Orchard Valley Farms & Market",
    town: "Paonia, CO",
    address: "15836 Black Bridge Rd, Paonia, CO 81428",
    type: "Orchard, farm market, winery",
    needs: ["food", "market", "wine", "dogs"],
    hours: "In season 10am–6pm daily, Memorial Day through Halloween",
    seasonal: "Cherries early summer; peaches mid-late summer; apples/pumpkins fall",
    dogFriendly: "Yes — dog-friendly park area",
    timeToSpend: "45–90 minutes",
    phone: "970-527-6838",
    website: "https://orchardvalleyfarms.com",
    tips: "Bring a box for u-pick. Picnic by the river. Black Bridge wines on site.",
    why: "Food, wine, scenery, and a river stop in one place.",
    rating: "really-good",
  },
  {
    id: "storm-cellar",
    name: "The Storm Cellar",
    town: "Hotchkiss, CO",
    address: "14139 Runzel Gulch Rd, Hotchkiss, CO 81419",
    type: "Boutique high-elevation winery",
    needs: ["wine", "scenic"],
    hours: "Typically Thu–Sun, noon–7pm, Memorial Day through late October",
    seasonal: "Tasting room is seasonal",
    dogFriendly: "Confirm patio policy before bringing a pet",
    timeToSpend: "60–90 minutes",
    phone: "970-589-3142",
    website: "https://stormcellarwine.com",
    tips: "Winding gravel road with two sharp switchbacks. Parking is limited. Slow for big rigs.",
    why: "Wow view plus serious wine. Makes the day feel special.",
    rating: "really-good",
  },
  {
    id: "big-bs",
    name: "Big B’s Delicious Orchards",
    town: "Hotchkiss, CO",
    address: "39126 Hwy 133, Hotchkiss, CO 81419",
    type: "Orchard, cafe, cider, campground",
    needs: ["food", "wine", "dogs", "sleep", "connectivity"],
    hours: "Open April–November; cafe and store through the growing season",
    seasonal: "Growing season only",
    dogFriendly: "Yes — leashed, well-behaved pets welcome",
    timeToSpend: "1–2 hours, or overnight if camping",
    phone: "970-527-1110",
    website: "https://www.bigbs.com",
    tips: "Easy pull-off on Hwy 133. Good lunch between wineries. Courtyard has WiFi.",
    why: "Food, drink, dogs, hang-out space, and optional sleep in one pin.",
    rating: "really-good",
  },
  {
    id: "farm-runners",
    name: "Farm Runners Station",
    town: "Hotchkiss, CO",
    address: "235 Hwy 133, Hotchkiss, CO 81419",
    type: "Farm market / cafe",
    needs: ["food", "market"],
    hours: "Often Wed–Sat 8:30am–5:30pm, Sun 10am–4pm — confirm",
    seasonal: "Year-round local food",
    dogFriendly: "Confirm before bringing a pet",
    timeToSpend: "20–40 minutes",
    phone: "970-872-9633",
    website: "https://www.farmrunners.com",
    tips: "Next to City Market on Hwy 133. Stock the cooler, not just browse.",
    why: "Practical resupply from Western Slope farms.",
    rating: "confirmed",
  },
  {
    id: "mesa-winds",
    name: "Mesa Winds Farm & Winery",
    town: "Hotchkiss, CO",
    address: "31262 L Rd, Hotchkiss, CO 81419",
    type: "Organic farm, vineyard, farm-to-table",
    needs: ["wine", "food", "scenic"],
    hours: "Seasonal; often evenings Wed–Sat and Sunday brunch. Call first.",
    seasonal: "Spring through harvest; closed winter",
    dogFriendly: "Pets listed on some directories; confirm patio rules",
    timeToSpend: "90 minutes–2 hours if eating",
    phone: "970-399-7491",
    website: "https://www.mesawindswinery.com",
    tips: "A destination, not a five-minute pour. Go when the kitchen is open.",
    why: "The stop that made a traveler want to make fruit wine.",
    rating: "must-do",
    notes: "Important wine stop. Helped inspire making fruit wine.",
  },
  {
    id: "pickin-in-the-park",
    name: "Pickin’ in the Park",
    town: "Paonia, CO",
    address: "Paonia Town Park, Paonia, CO 81428",
    type: "Free outdoor concert series",
    needs: ["event", "food"],
    hours: "Thursday evenings in August, music from 6pm",
    seasonal: "August only",
    dogFriendly: "Leashed dogs often present; confirm current park rules",
    timeToSpend: "2–4 hours",
    website: "https://pickinproductions.com/pickin-in-the-park",
    tips: "Bring a chair or blanket. Arrive before 6 for a good spot.",
    why: "Turns tasting rooms into an evening spent in the town.",
    rating: "really-good",
  },
  {
    id: "curecanti-pine-point",
    name: "Curecanti — Pine Point / Pine Creek",
    town: "Curecanti National Recreation Area",
    address: "Pine Creek Trailhead off US-50, west of Hwy 92 junction",
    type: "Scenic hike / reservoir",
    needs: ["scenic", "dogs", "bathroom"],
    hours: "Day-use; trailhead access can close for construction",
    seasonal: "Best late spring–fall",
    dogFriendly: "Yes — pets on leash",
    timeToSpend: "1–2 hours",
    website: "https://www.nps.gov/thingstodo/pine-creek-trail.htm",
    tips: "Bring water. The climb back up is the workout. Official trail is Pine Creek.",
    why: "Breaks the food-and-wine loop with a real landscape memory.",
    rating: "must-do",
    notes: "Walked all the way down along the reservoir / river area.",
  },
  {
    id: "cedaredge",
    name: "Cedaredge",
    town: "Cedaredge, CO",
    address: "Cedaredge, Delta County, CO",
    type: "Town / Grand Mesa gateway",
    needs: ["food", "scenic"],
    hours: "Town daytime",
    seasonal: "Applefest in October",
    dogFriendly: "Town parks generally yes",
    timeToSpend: "45–90 minutes",
    tips: "Western extension toward Grand Mesa. Exact in-town stop still TBD.",
    why: "Confirmed town on the same trip — keep as a pin until more detail lands.",
    rating: "confirmed",
  },
];

const KEY = "romi-local";

function loadState(): { savedIds: string[]; plans: Plan[] } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { savedIds: [], plans: [] };
    const parsed = JSON.parse(raw) as { savedIds?: string[]; plans?: Plan[] };
    return { savedIds: parsed.savedIds ?? [], plans: parsed.plans ?? [] };
  } catch {
    return { savedIds: [], plans: [] };
  }
}

function RatingBadge({ rating }: { rating: Rating }) {
  const label = rating === "must-do" ? "Must-do" : rating === "really-good" ? "Really good" : "Confirmed";
  const cls =
    rating === "must-do"
      ? "bg-[#8B5A3C] text-[#FAF7F1]"
      : rating === "really-good"
        ? "bg-[#3F5A46]/15 text-[#3F5A46]"
        : "border border-[#1f1a141f] text-[#6D6458]";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [q, setQ] = useState("");
  const [need, setNeed] = useState<"all" | Need>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("Paonia Wine Country");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = loadState();
    setSavedIds(s.savedIds);
    setPlans(s.plans);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify({ savedIds, plans }));
  }, [savedIds, plans, ready]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return places.filter((p) => {
      if (need !== "all" && !p.needs.includes(need)) return false;
      if (!query) return true;
      return [p.name, p.town, p.type, p.why, p.notes ?? ""].join(" ").toLowerCase().includes(query);
    });
  }, [q, need]);

  const openPlace = places.find((p) => p.id === openId) ?? null;
  const openPlan = plans.find((p) => p.id === openPlanId) ?? null;

  function toggleSave(id: string) {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addToPlan(placeId: string) {
    setPlans((prev) => {
      if (prev[0]) {
        if (prev[0].placeIds.includes(placeId)) return prev;
        return prev.map((p, i) => (i === 0 ? { ...p, placeIds: [...p.placeIds, placeId] } : p));
      }
      return [{ id: `plan-${Date.now()}`, name: "Paonia Wine Country", placeIds: [placeId] }];
    });
  }

  function PlaceCard({ place }: { place: Place }) {
    const saved = savedIds.includes(place.id);
    return (
      <article className="rounded-2xl border border-[#1f1a141f] bg-[#FAF7F1] p-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <RatingBadge rating={place.rating} />
          <span className="text-xs text-[#6D6458]">{place.type}</span>
        </div>
        <button type="button" className="text-left text-lg font-semibold text-[#1F1A14]" onClick={() => setOpenId(place.id)}>
          {place.name}
        </button>
        <p className="text-sm text-[#6D6458]">{place.town}</p>
        <p className="mt-2 text-sm leading-relaxed">{place.why}</p>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-lg border border-[#1f1a141f] px-3 text-sm"
          onClick={() => toggleSave(place.id)}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </article>
    );
  }

  if (openPlace) {
    const saved = savedIds.includes(openPlace.id);
    return (
      <Shell tab={tab} setTab={setTab}>
        <button type="button" className="text-sm text-[#6D6458]" onClick={() => setOpenId(null)}>
          Back
        </button>
        <RatingBadge rating={openPlace.rating} />
        <h1 className="mt-2 text-3xl font-semibold leading-tight">{openPlace.name}</h1>
        <p className="text-sm text-[#6D6458]">
          {openPlace.type} · {openPlace.town}
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" className="min-h-11 rounded-lg bg-[#3F5A46] px-4 text-sm text-[#F7F4EE]" onClick={() => toggleSave(openPlace.id)}>
            {saved ? "Saved" : "Save"}
          </button>
          <button type="button" className="min-h-11 rounded-lg border border-[#1f1a141f] px-4 text-sm" onClick={() => addToPlan(openPlace.id)}>
            Add to plan
          </button>
        </div>
        {openPlace.notes ? <p className="mt-4 rounded-2xl bg-[#EBE4D6] p-4 text-sm">{openPlace.notes}</p> : null}
        <p className="mt-4 text-sm leading-relaxed">{openPlace.why}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Address" value={openPlace.address} />
          <Row label="Hours" value={openPlace.hours} />
          <Row label="Season" value={openPlace.seasonal} />
          <Row label="Time" value={openPlace.timeToSpend} />
          <Row label="Dogs" value={openPlace.dogFriendly} />
          {openPlace.phone ? <Row label="Phone" value={openPlace.phone} /> : null}
          <Row label="Tip" value={openPlace.tips} />
        </dl>
      </Shell>
    );
  }

  if (openPlan) {
    const stops = openPlan.placeIds.map((id) => places.find((p) => p.id === id)).filter((p): p is Place => !!p);
    return (
      <Shell tab={tab} setTab={setTab}>
        <button type="button" className="text-sm text-[#6D6458]" onClick={() => setOpenPlanId(null)}>
          All plans
        </button>
        <h1 className="mt-2 text-3xl font-semibold">{openPlan.name}</h1>
        {stops.length === 0 ? (
          <p className="mt-3 text-sm text-[#6D6458]">Empty. Open a place and tap Add to plan.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {stops.map((place, i) => (
              <li key={place.id}>
                <p className="mb-1 text-xs uppercase tracking-wide text-[#6D6458]">Stop {i + 1}</p>
                <PlaceCard place={place} />
              </li>
            ))}
          </ol>
        )}
      </Shell>
    );
  }

  return (
    <Shell tab={tab} setTab={setTab}>
      {tab === "today" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#6D6458]">Today</p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight">North Fork Valley</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6D6458]">
              A tested Colorado wine-country stretch from a real traveler’s route. Start with bread. End with canyon light if you have the time.
            </p>
          </div>
          <section className="rounded-2xl border border-[#1f1a141f] bg-[#FAF7F1] p-4">
            <h2 className="text-sm font-medium">Tonight and the next two days</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Sleep — Big B’s campground if you want orchard quiet</li>
              <li>Food — Paonia Bread Works before they close at 1</li>
              <li>Wine — Mesa Winds when the kitchen is open</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Must-do</h2>
            {places.filter((p) => p.rating === "must-do").map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </section>
        </div>
      )}

      {tab === "search" && (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Search</h1>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try Bread Works, Mesa Winds, Pine Point"
            className="h-11 w-full rounded-lg border border-[#1f1a141f] bg-[#FAF7F1] px-3 text-sm"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "food", "wine", "scenic", "dogs", "sleep", "market", "event"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setNeed(id)}
                className={`min-h-10 shrink-0 rounded-full border px-3 text-sm ${
                  need === id ? "border-[#3F5A46] bg-[#3F5A46] text-[#F7F4EE]" : "border-[#1f1a141f] bg-[#FAF7F1]"
                }`}
              >
                {id === "all" ? "All" : NEED_LABELS[id]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {results.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      )}

      {tab === "saved" && (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Saved</h1>
          {savedIds.length === 0 ? (
            <p className="text-sm text-[#6D6458]">Nothing saved yet. Search Bread Works and tap Save.</p>
          ) : (
            <div className="space-y-3">
              {savedIds.map((id) => places.find((p) => p.id === id)).filter((p): p is Place => !!p).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "plans" && (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Plans</h1>
          <form
            className="space-y-3 rounded-2xl border border-[#1f1a141f] bg-[#FAF7F1] p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const id = `plan-${Date.now()}`;
              setPlans((prev) => [...prev, { id, name: planName.trim() || "Untitled plan", placeIds: [] }]);
              setOpenPlanId(id);
            }}
          >
            <label className="text-sm font-medium" htmlFor="plan-name">
              New plan
            </label>
            <input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="h-11 w-full rounded-lg border border-[#1f1a141f] px-3 text-sm"
            />
            <button type="submit" className="min-h-11 rounded-lg bg-[#3F5A46] px-4 text-sm text-[#F7F4EE]">
              Create plan
            </button>
          </form>
          {plans.length === 0 ? (
            <p className="text-sm text-[#6D6458]">No plans yet. Create one, then add places from a place page.</p>
          ) : (
            <ul className="space-y-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-[#1f1a141f] bg-[#FAF7F1] p-4 text-left"
                    onClick={() => setOpenPlanId(plan.id)}
                  >
                    <p className="text-lg font-semibold">{plan.name}</p>
                    <p className="text-sm text-[#6D6458]">
                      {plan.placeIds.length} stop{plan.placeIds.length === 1 ? "" : "s"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#6D6458]">{label}</dt>
      <dd className="mt-0.5 leading-relaxed">{value}</dd>
    </div>
  );
}

function Shell({
  children,
  tab,
  setTab,
}: {
  children: React.ReactNode;
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const items: { id: Tab; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "search", label: "Search" },
    { id: "saved", label: "Saved" },
    { id: "plans", label: "Plans" },
  ];
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#F3EEE4] text-[#1F1A14]">
      <header className="sticky top-0 border-b border-[#1f1a141f] bg-[#F3EEE4]/90 px-5 py-3 backdrop-blur-sm">
        <p className="text-xl font-semibold">Romi</p>
        <p className="text-xs text-[#6D6458]">Road life, tested in real places</p>
      </header>
      <main className="px-5 pb-28 pt-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-lg border-t border-[#1f1a141f] bg-[#FAF7F1]">
        <ul className="grid grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex min-h-14 w-full items-center justify-center text-xs ${
                  tab === item.id ? "font-semibold text-[#3F5A46]" : "text-[#6D6458]"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";

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
];

const suggestedAreas = [
  "Lodgepole Campground, Colorado",
  "Gunnison, Colorado",
  "Almont, Colorado",
];

const realStops = [
  {
    id: "lodgepole-campground",
    icon: "🏕️",
    name: "Lodgepole Campground",
    description:
      "National Forest campground near Almont and Gunnison, Colorado. A first real ROMI place: overnight, water access, dogs on leash, and nearby adventure.",
    helpsWith: ["Sleep", "Water", "Adventure", "Dog Needs"],
    note: "Confirm current season, water, and fees before you go. Dogs are typically OK on a leash.",
  },
];

type Screen = "home" | "plan" | "results" | "report";

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

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [location, setLocation] = useState("");

  const [travelerReports, setTravelerReports] = useState<TravelerReport[]>([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);

  const [reportName, setReportName] = useState("");
  const [reportArea, setReportArea] = useState("");
  const [reportNeeds, setReportNeeds] = useState<string[]>([]);
  const [dogFriendly, setDogFriendly] = useState("");
  const [shade, setShade] = useState("");
  const [wifi, setWifi] = useState("");
  const [vibe, setVibe] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [returnAgain, setReturnAgain] = useState("");

  useEffect(() => {
    try {
      const savedReports = window.localStorage.getItem("romi-traveler-reports");

      if (savedReports) {
        const parsedReports = JSON.parse(savedReports);

        if (Array.isArray(parsedReports)) {
          setTravelerReports(parsedReports);
        }
      }

      const savedPlaces = window.localStorage.getItem("romi-saved-places");
      if (savedPlaces) {
        const parsedPlaces = JSON.parse(savedPlaces);
        if (Array.isArray(parsedPlaces)) {
          setSavedPlaceIds(parsedPlaces);
        }
      }
    } catch {
      // ROMI will simply start with no reports if storage is unavailable.
    } finally {
      setHasLoadedReports(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedReports) return;

    try {
      window.localStorage.setItem(
        "romi-traveler-reports",
        JSON.stringify(travelerReports)
      );
      window.localStorage.setItem(
        "romi-saved-places",
        JSON.stringify(savedPlaceIds)
      );
    } catch {
      // Reports still work for this visit if device storage is unavailable.
    }
  }, [travelerReports, savedPlaceIds, hasLoadedReports]);

  function toggleSavePlace(placeId: string) {
    setSavedPlaceIds((current) =>
      current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId]
    );
  }

  function toggleNeed(label: string) {
    setSelectedNeeds((current) =>
      current.includes(label)
        ? current.filter((need) => need !== label)
        : [...current, label]
    );
  }

  function toggleReportNeed(label: string) {
    setReportNeeds((current) =>
      current.includes(label)
        ? current.filter((need) => need !== label)
        : [...current, label]
    );
  }

  function matchingNeeds(placeNeeds: string[]) {
    return selectedNeeds.filter((need) => placeNeeds.includes(need));
  }

  function findHelpfulStops(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (location.trim()) {
      setScreen("results");
    }
  }

  function chooseSuggestedArea(area: string) {
    setLocation(area);
    setScreen("results");
  }

  function startPlaceReport() {
    setReportName("");
    setReportArea(location);
    setReportNeeds(selectedNeeds);
    setDogFriendly("");
    setShade("");
    setWifi("");
    setVibe("");
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
      dogFriendly,
      shade,
      wifi,
      vibe,
      notes: reportNotes.trim(),
      returnAgain,
    };

    setTravelerReports((current) => [newReport, ...current]);
    setLocation(reportArea.trim());
    setScreen("results");
  }

  function goHome() {
    setSelectedNeeds([]);
    setLocation("");
    setScreen("home");
  }

  if (screen === "report") {
    return (
      <main className="min-h-screen bg-amber-50 px-5 py-8 text-slate-800">
        <section className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setScreen("results")}
            className="text-sm font-bold text-teal-700"
          >
            ← Back to helpful stops
          </button>

          <header className="mt-6">
            <p className="text-sm font-bold tracking-[0.22em] text-teal-700">
              ROMI SCOUT REPORT
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
              Add a place you know
            </h1>
            <p className="mt-2 leading-6 text-slate-600">
              Share only what you personally experienced. Honest notes are what make
              ROMI useful.
            </p>
          </header>

          <form onSubmit={savePlaceReport} className="mt-8 space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                PLACE BASICS
              </p>

              <label htmlFor="reportName" className="mt-4 block text-sm font-bold">
                Place name
              </label>
              <input
                id="reportName"
                required
                value={reportName}
                onChange={(event) => setReportName(event.target.value)}
                placeholder="Example: Lodgepole Campground"
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
              />

              <label htmlFor="reportArea" className="mt-4 block text-sm font-bold">
                Town, area, or state
              </label>
              <input
                id="reportArea"
                required
                value={reportArea}
                onChange={(event) => setReportArea(event.target.value)}
                placeholder="Example: Gunnison, Colorado"
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
              />
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                WHAT CAN THIS PLACE HELP WITH?
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {needs.map((need) => {
                  const chosen = reportNeeds.includes(need.label);

                  return (
                    <button
                      key={need.label}
                      type="button"
                      onClick={() => toggleReportNeed(need.label)}
                      className={`rounded-2xl p-3 text-left ring-1 ${
                        chosen
                          ? "bg-orange-500 text-white ring-orange-500"
                          : "bg-amber-50 text-slate-800 ring-amber-100"
                      }`}
                    >
                      <span className="text-2xl">{need.icon}</span>
                      <span className="mt-2 block text-sm font-bold">
                        {need.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                TRAVELER DETAILS
              </p>

              <label className="mt-4 block text-sm font-bold">
                🐾 Dog friendliness
              </label>
              <select
                value={dogFriendly}
                onChange={(event) => setDogFriendly(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3"
              >
                <option value="">I’m not sure / did not check</option>
                <option value="Dog-friendly">Dog-friendly</option>
                <option value="Dogs allowed with limits">Dogs allowed with limits</option>
                <option value="Not dog-friendly">Not dog-friendly</option>
              </select>

              <label className="mt-4 block text-sm font-bold">
                🌤️ Shade and comfort
              </label>
              <select
                value={shade}
                onChange={(event) => setShade(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3"
              >
                <option value="">I’m not sure / did not check</option>
                <option value="Lots of shade">Lots of shade</option>
                <option value="Some shade">Some shade</option>
                <option value="Very little shade">Very little shade</option>
              </select>

              <label className="mt-4 block text-sm font-bold">
                📶 Wi-Fi or cell
              </label>
              <select
                value={wifi}
                onChange={(event) => setWifi(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3"
              >
                <option value="">I’m not sure / did not check</option>
                <option value="Wi-Fi available">Wi-Fi available</option>
                <option value="Cell signal worked">Cell signal worked</option>
                <option value="Limited signal">Limited signal</option>
                <option value="No useful signal">No useful signal</option>
              </select>

              <label htmlFor="vibe" className="mt-4 block text-sm font-bold">
                ✨ What was the vibe?
              </label>
              <input
                id="vibe"
                value={vibe}
                onChange={(event) => setVibe(event.target.value)}
                placeholder="Quiet, family-friendly, scenic, busy..."
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3"
              />

              <label htmlFor="notes" className="mt-4 block text-sm font-bold">
                Your honest notes
              </label>
              <textarea
                id="notes"
                rows={5}
                value={reportNotes}
                onChange={(event) => setReportNotes(event.target.value)}
                placeholder="What should another traveler know before they go?"
                className="mt-2 w-full resize-none rounded-2xl border border-amber-200 px-4 py-3"
              />

              <label className="mt-4 block text-sm font-bold">
                Would you come back?
              </label>
              <select
                value={returnAgain}
                onChange={(event) => setReturnAgain(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3"
              >
                <option value="">Choose one</option>
                <option value="Absolutely, I would come back">
                  Absolutely, I would come back
                </option>
                <option value="Maybe, depending on the trip">
                  Maybe, depending on the trip
                </option>
                <option value="Probably not">Probably not</option>
              </select>
            </section>

            <button
              type="submit"
              disabled={!reportName.trim() || !reportArea.trim()}
              className="w-full rounded-full bg-orange-600 px-5 py-4 font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              Save my real place report →
            </button>

            <p className="pb-3 text-center text-xs text-slate-500">
              Reports save on this device and will still be here after you refresh.
            </p>
          </form>
        </section>
      </main>
    );
  }

  if (screen === "results") {
    return (
      <main className="min-h-screen bg-amber-50 px-5 py-8 text-slate-800">
        <section className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setScreen("plan")}
            className="text-sm font-bold text-teal-700"
          >
            ← Change my starting area
          </button>

          <header className="mt-6">
            <p className="text-sm font-bold tracking-[0.22em] text-teal-700">
              ROMI
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Your Helpful Stops
            </h1>
            <p className="mt-2 text-slate-600">
              Your first ROMI plan for {location}.
            </p>
          </header>

          <section className="mt-7 rounded-3xl bg-teal-700 p-6 text-white shadow-lg">
            <p className="text-xs font-bold tracking-[0.18em] text-teal-100">
              YOUR ROAD-DAY MISSION
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {selectedNeeds.length} thing
              {selectedNeeds.length === 1 ? "" : "s"} to handle
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedNeeds.map((need) => (
                <span
                  key={need}
                  className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold"
                >
                  {need}
                </span>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={startPlaceReport}
            className="mt-6 w-full rounded-3xl bg-orange-600 p-5 text-left text-white shadow-md"
          >
            <p className="text-xs font-bold tracking-[0.16em] text-orange-100">
              HELP BUILD ROMI
            </p>
            <p className="mt-2 text-xl font-black">＋ Add a real place to ROMI</p>
            <p className="mt-1 text-sm text-orange-50">
              Share a place you personally know—like Lodgepole Campground.
            </p>
          </button>

          {travelerReports.length > 0 && (
            <section className="mt-8">
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                REAL TRAVELER REPORTS
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">
                Added by you
              </h3>

              <div className="mt-4 space-y-4">
                {travelerReports.map((report, index) => (
                  <article
                    key={`${report.name}-${report.area}-${index}`}
                    className="rounded-3xl border-2 border-teal-200 bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
                      ✓ REAL TRAVELER REPORT
                    </p>
                    <h4 className="mt-1 text-xl font-black text-slate-900">
                      {report.name}
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      📍 {report.area}
                    </p>

                    {report.helpsWith.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {report.helpsWith.map((need) => (
                          <span
                            key={need}
                            className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      {report.dogFriendly && <p>🐾 {report.dogFriendly}</p>}
                      {report.shade && <p>🌤️ {report.shade}</p>}
                      {report.wifi && <p>📶 {report.wifi}</p>}
                      {report.vibe && <p>✨ {report.vibe}</p>}
                    </div>

                    {report.notes && (
                      <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-slate-700">
                        “{report.notes}”
                      </p>
                    )}

                    {report.returnAgain && (
                      <p className="mt-3 font-bold text-teal-800">
                        🧭 {report.returnAgain}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {savedPlaceIds.length > 0 && (
            <section className="mt-8">
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                SAVED PLACES
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">
                Still here after refresh
              </h3>
              <div className="mt-4 space-y-4">
                {realStops
                  .filter((stop) => savedPlaceIds.includes(stop.id))
                  .map((stop) => (
                    <article
                      key={`saved-${stop.id}`}
                      className="rounded-3xl border-2 border-teal-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
                        ✓ SAVED
                      </p>
                      <h4 className="mt-1 text-xl font-black text-slate-900">
                        {stop.name}
                      </h4>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        📍 near Almont / Gunnison, Colorado
                      </p>
                    </article>
                  ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
              REAL ROMI PLACES
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              Places that could help together
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              First real stop in ROMI: Lodgepole Campground. More real places
              come next — still inside this same screen.
            </p>

            <div className="mt-5 space-y-4">
              {realStops.map((stop) => {
                const matches = matchingNeeds(stop.helpsWith);
                const saved = savedPlaceIds.includes(stop.id);

                return (
                  <article
                    key={stop.id}
                    className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-100"
                  >
                    <div className="flex gap-3">
                      <span className="text-3xl">{stop.icon}</span>
                      <div>
                        <p className="text-xs font-bold tracking-[0.14em] text-teal-700">
                          {matches.length > 0
                            ? `${matches.length} MISSION MATCH${
                                matches.length === 1 ? "" : "ES"
                              }`
                            : "REAL ROMI STOP"}
                        </p>
                        <h4 className="mt-1 text-lg font-black text-slate-900">
                          {stop.name}
                        </h4>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {stop.description}
                    </p>

                    {matches.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {matches.map((need) => (
                          <span
                            key={need}
                            className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-4 rounded-2xl bg-teal-50 p-3 text-sm font-semibold text-teal-800">
                      🧭 {stop.note}
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleSavePlace(stop.id)}
                      className={`mt-4 w-full rounded-full px-5 py-3 font-bold ${
                        saved
                          ? "border border-teal-700 bg-white text-teal-700"
                          : "bg-orange-600 text-white"
                      }`}
                    >
                      {saved ? "Saved — tap to unsave" : "Save this place"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={goHome}
            className="mt-6 w-full rounded-full border border-teal-700 bg-white px-5 py-3 font-bold text-teal-700"
          >
            Start a new road-day mission
          </button>
        </section>
      </main>
    );
  }

  if (screen === "plan") {
    return (
      <main className="min-h-screen bg-amber-50 px-5 py-8 text-slate-800">
        <section className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="text-sm font-bold text-teal-700"
          >
            ← Edit my road-day mission
          </button>

          <header className="mt-6">
            <p className="text-sm font-bold tracking-[0.22em] text-teal-700">
              ROMI
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Your Quick Plan
            </h1>
            <p className="mt-2 text-slate-600">
              Let’s build a practical next stop around what you actually need.
            </p>
          </header>

          <section className="mt-7 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
            <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
              STARTING AREA
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              Where are you headed?
            </h3>

            <form onSubmit={findHelpfulStops} className="mt-5">
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Try Gunnison, Colorado"
                className="w-full rounded-2xl border border-amber-200 px-4 py-4 outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="submit"
                disabled={!location.trim()}
                className="mt-4 w-full rounded-full bg-orange-600 px-5 py-3 font-bold text-white disabled:bg-orange-300"
              >
                Find helpful stops →
              </button>
            </form>

            <div className="mt-6">
              <p className="text-xs font-bold tracking-[0.14em] text-slate-500">
                TRY A ROMI TEST AREA
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => chooseSuggestedArea(area)}
                    className="rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-8 text-slate-800">
      <section className="mx-auto max-w-md">
        <header>
          <p className="text-sm font-bold tracking-[0.22em] text-teal-700">
            ROMI
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            The Travel Companion
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Road-life Operations, Mapping &amp; Insights
          </p>
        </header>

        <section className="mt-7 rounded-3xl bg-teal-700 p-6 text-white shadow-lg">
          <p className="text-xs font-bold tracking-[0.18em] text-teal-100">
            TODAY
          </p>
          <h2 className="mt-2 text-3xl font-black">
            What do you need today?
          </h2>
          <p className="mt-3 text-teal-50">
            Pick one thing—or build a whole little road-day mission.
          </p>
        </section>

        <section className="mt-8">
          <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
            FIND WHAT HELPS
          </p>
          <h3 className="mt-1 text-2xl font-black text-slate-900">
            Pick your road-life needs
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose as many as you need. Tap one again to remove it.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {needs.map((need) => {
              const chosen = selectedNeeds.includes(need.label);

              return (
                <button
                  key={need.label}
                  type="button"
                  onClick={() => toggleNeed(need.label)}
                  className={`rounded-2xl p-4 text-left shadow-sm ring-1 ${
                    chosen
                      ? "bg-orange-500 text-white ring-orange-500"
                      : "bg-white text-slate-800 ring-amber-100"
                  }`}
                >
                  <span className="text-3xl">{need.icon}</span>
                  <span className="mt-3 block font-bold">{need.label}</span>
                  <span
                    className={`mt-1 block text-xs ${
                      chosen ? "text-orange-50" : "text-slate-500"
                    }`}
                  >
                    {need.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 p-5">
          {selectedNeeds.length > 0 ? (
            <>
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                YOUR ROAD-DAY MISSION
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">
                {selectedNeeds.length} thing
                {selectedNeeds.length === 1 ? "" : "s"} to handle
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedNeeds.map((need) => (
                  <span
                    key={need}
                    className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-orange-700"
                  >
                    {need}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setScreen("plan")}
                className="mt-5 w-full rounded-full bg-orange-600 px-5 py-3 font-bold text-white"
              >
                Build my quick plan →
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700">
                ROMI IS READY
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">
                Your road buddy, not just another map
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Tell ROMI what you need, and it will help build a practical next stop.
              </p>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

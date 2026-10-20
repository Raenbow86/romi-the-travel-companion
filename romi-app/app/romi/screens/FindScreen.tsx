"use client";

import { NEED_BY_LABEL } from "@/lib/needs";
import { needs } from "../data";
import { useRomi } from "../RomiContext";
import { Eyebrow, Shell, card, chip, dropdown, field, primaryBtn } from "../ui";

const QUICK_AREAS = ["Paonia, Colorado", "Gunnison, Colorado", "Salida, CO 81201", "Colorado Springs, Colorado"];

export function FindScreen() {
  const r = useRomi();
  const {
    origin,
    locationDraft,
    setLocationDraft,
    areaSuggestions,
    geoStatus,
    radiusMiles,
    setRadiusMiles,
    selectedNeeds,
    refinements,
    setRefinements,
    placeSearch,
    setPlaceSearch,
    briefDraft,
    setBriefDraft,
    suggestions,
    romiReply,
    isSearching,
  } = r;
  const count = r.allCards().length;

  return (
    <Shell>
      <Eyebrow>FIND</Eyebrow>
      <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
        What do you need
        <br />
        right now?
      </h1>

      <form onSubmit={r.geocodeDraft} className="relative z-30 mt-5">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">📍</span>
            <input
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              placeholder="Town or ZIP — Moab, 81201…"
              className={`${field} pl-11 font-semibold`}
            />
          </div>
          <button type="submit" className="min-w-16 rounded-2xl bg-slate-800 px-4 font-bold text-white">
            Go
          </button>
          {areaSuggestions.length > 0 && (
            <div className={`${dropdown} top-14`}>
              {areaSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => r.pickArea(s.id, s.name, s.area)}
                  className="block w-full border-b border-slate-100 px-4 py-3.5 text-left last:border-0"
                >
                  <p className="font-bold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.area}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={r.useMyLocation} className={`${chip(false)} shrink-0`}>
            ◎ Use my location
          </button>
          {QUICK_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => {
                setLocationDraft(area);
                void (async () => {
                  const res = await fetch(`/api/geocode?q=${encodeURIComponent(area)}`);
                  const data = await res.json();
                  if (data.lat) r.applyOrigin(data.label || area, data.lat, data.lng);
                })();
              }}
              className={`${chip(origin?.label === area)} shrink-0`}
            >
              {area.split(",")[0]}
            </button>
          ))}
        </div>
        {geoStatus ? <p className="mt-2 text-sm text-slate-500">{geoStatus}</p> : null}
      </form>

      {origin ? (
        <div className="mt-5">
          <Eyebrow>WITHIN · {origin.label.split(",")[0].toUpperCase()}</Eyebrow>
          <div className="mt-2 flex rounded-2xl bg-slate-100 p-1">
            {[10, 15, 20].map((miles) => (
              <button
                key={miles}
                type="button"
                onClick={() => setRadiusMiles(miles)}
                className={`min-h-12 flex-1 rounded-xl text-[15px] font-bold ${
                  radiusMiles === miles ? "bg-slate-800 text-white shadow-sm" : "text-slate-500"
                }`}
              >
                {miles} mi
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <Eyebrow>I NEED</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          {needs.map((need) => (
            <button
              key={need.label}
              type="button"
              onClick={() => r.toggleNeed(need.label)}
              className={chip(selectedNeeds.includes(need.label))}
            >
              {need.icon} {need.label}
            </button>
          ))}
        </div>
      </div>

      {selectedNeeds.length > 0 && (
        <div className="mt-4">
          <Eyebrow>MORE SPECIFIC (OPTIONAL)</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedNeeds
              .flatMap((need) => NEED_BY_LABEL[need]?.subChips.map((sub) => sub.label) || [])
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
                        : r.addRefinement(detail)
                    }
                    className={chip(on)}
                  >
                    {detail}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {refinements.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {refinements.map((item) => (
            <button
              key={`ref-${item}`}
              type="button"
              onClick={() => setRefinements((current) => current.filter((x) => x !== item))}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              {item} ×
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const text = briefDraft.trim() || placeSearch.trim();
          if (!text) return;
          if (text.split(/\s+/).length >= 4 || /need|want|like/i.test(text)) {
            setBriefDraft(text);
            r.talkToRomi(event);
          } else {
            setPlaceSearch(text);
            setBriefDraft("");
          }
        }}
        className="relative z-40 mt-5"
      >
        <span className="pointer-events-none absolute left-4 top-4">💬</span>
        <input
          value={placeSearch || briefDraft}
          onChange={(event) => {
            const value = event.target.value;
            setPlaceSearch(value);
            setBriefDraft(value);
          }}
          placeholder="Or tell Romi… “quiet spot, big rig parking”"
          className={`${field} bg-slate-100 pl-11`}
        />
        {suggestions.length > 0 && (
          <div className={`${dropdown} top-14`}>
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  void r.pickSuggestion(s.id, s.name);
                  r.setHomeView("results");
                }}
                className="block w-full border-b border-slate-100 px-4 py-3.5 text-left last:border-0"
              >
                <p className="font-bold text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s.area}</p>
              </button>
            ))}
          </div>
        )}
      </form>
      {romiReply ? <p className={`${card} mt-3 text-sm font-semibold text-slate-700`}>{romiReply}</p> : null}

      <button type="button" disabled={!origin} onClick={() => r.setHomeView("results")} className={`${primaryBtn} mt-6`}>
        {!origin
          ? "Set a location first"
          : isSearching
            ? "Looking around…"
            : `Show ${count} place${count === 1 ? "" : "s"}`}
      </button>
    </Shell>
  );
}

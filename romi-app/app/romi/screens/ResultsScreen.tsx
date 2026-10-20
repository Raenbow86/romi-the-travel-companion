"use client";

import { RomiMap } from "../../RomiMap";
import { useRomi } from "../RomiContext";
import { Eyebrow, Shell, card, field, primaryBtn } from "../ui";
import { PlaceCard } from "./PlaceCard";
import { resultsCaption } from "../searchState";

export function ResultsScreen() {
  const r = useRomi();
  const { origin, viewingSavedDay, selectedNeeds, refinements, appliedArea, isSearching, dayName, setDayName } = r;
  const cards = r.allCards();
  const filterSummary = [...selectedNeeds, ...refinements].join(" · ") || "Everything";

  return (
    <Shell>
      <div className="relative z-0 isolate -mx-5 -mt-6 overflow-hidden rounded-b-[28px]">
        <RomiMap
          compact
          stops={r.mapStops()}
          onSelect={(id) => {
            r.setHighlightedId(id);
            r.setExpandedId(id);
            window.scrollTo({ top: 0 });
          }}
        />
        <button
          type="button"
          onClick={() => r.setHomeView("find")}
          className="absolute right-3 top-3 z-[400] max-w-[72%] truncate rounded-full bg-white px-4 py-3 text-[13px] font-bold text-slate-800 shadow-lg"
        >
          {viewingSavedDay ? `🔖 ${viewingSavedDay.name}` : `${filterSummary}${appliedArea ? ` · ${appliedArea.radiusMiles} mi` : ""}`} ✎
        </button>
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <Eyebrow>{resultsCaption(appliedArea, cards.length, isSearching).toUpperCase()}</Eyebrow>
        <p className="text-xs font-semibold text-slate-400">
          <span className="text-teal-700">■</span> scout verified · <span className="text-orange-600">■</span> Google lead
        </p>
      </div>
      <div className="mt-3 space-y-3">
        {isSearching ? (
          <div role="status" aria-live="polite" className={`${card} flex items-center gap-3 text-sm font-semibold text-slate-600`}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
            Finding places nearby…
          </div>
        ) : null}
        {cards.map((c) => (
          <PlaceCard key={c.id} place={c} />
        ))}
        {origin && cards.length === 0 && !isSearching ? (
          <div className={`${card} text-sm text-slate-600`}>
            Nothing matched those filters in this radius. Clear a filter or move the location.
            <button type="button" onClick={() => r.setHomeView("find")} className={`${primaryBtn} mt-3`}>
              Change filters
            </button>
          </div>
        ) : null}
      </div>

      {origin && !viewingSavedDay && (
        <section className={`${card} mt-6`}>
          <Eyebrow>SAVE THIS DAY</Eyebrow>
          <input
            value={dayName}
            onChange={(e) => setDayName(e.target.value)}
            placeholder={`${origin.label.split(",")[0]} day`}
            className={`${field} mt-3`}
          />
          <button type="button" onClick={r.saveThisDay} className={`${primaryBtn} mt-3`}>
            Save this plan
          </button>
        </section>
      )}
    </Shell>
  );
}

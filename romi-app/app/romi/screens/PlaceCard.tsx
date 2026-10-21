"use client";

import { comboBadge } from "@/lib/needs";
import type { CardPlace } from "../data";
import { useRomi } from "../RomiContext";
import { GOOGLE_EDGE, StatusBadge, VERIFIED_EDGE, card } from "../ui";

export function statusLabel(status: "verified" | "google", askStatus?: string) {
  if (status === "google") return "GOOGLE · NEEDS A SCOUT";
  return askStatus === "sent-to-scouts" ? "NEEDS A NEW SCOUT" : "SCOUT VERIFIED";
}

export function ratingLine(
  romi: { avg: number; count: number } | null,
  place: Pick<CardPlace, "rating" | "reviewCount" | "hours">,
) {
  const parts: string[] = [];
  if (romi) parts.push(`Travelers ★ ${romi.avg} (${romi.count})`);
  else if (place.rating) parts.push(`Google ★ ${place.rating}${place.reviewCount ? ` (${place.reviewCount})` : ""}`);
  if (place.hours) parts.push(`🕒 ${place.hours}`);
  return parts.join(" · ");
}

export function PlaceCard({ place }: { place: CardPlace }) {
  const r = useRomi();
  const status = place.status || "verified";
  const matches = r.matchingNeeds(place.helpsWith || [], place.subChips);
  const combo = comboBadge(matches);
  const line = ratingLine(r.travelerScore(place.id, place.name), place);
  const dist = r.origin
    ? `${(Math.round(r.milesFromOrigin(place) * 10) / 10).toFixed(1)} mi`
    : "";

  return (
    <button
      type="button"
      id={`place-${place.id}`}
      onClick={() => {
        r.setHighlightedId(place.id);
        r.setExpandedId(place.id);
        r.setReviewStars(0);
        r.setReviewText("");
        r.setReviewThanks("");
        window.scrollTo({ top: 0 });
      }}
      className={`${card} block w-full text-left ${status === "verified" ? VERIFIED_EDGE : GOOGLE_EDGE} ${
        r.highlightedId === place.id ? "ring-2 ring-slate-800" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <StatusBadge status={status} label={statusLabel(status, r.latestAsk(place.id)?.status)} />
          <p className="mt-2 text-[17px] font-extrabold leading-6 text-slate-900">{place.name}</p>
          <p className="text-[13px] text-slate-500">
            {dist ? `${dist} · ` : ""}
            {place.area}
          </p>
          {line ? <p className="mt-1 text-[13px] font-semibold text-slate-600">{line}</p> : null}
        </div>
        <span className="text-3xl">{place.icon}</span>
      </div>
      {combo ? <p className="mt-2 text-[13px] font-bold text-slate-800">{combo}</p> : null}
      {place.helpsWith && place.helpsWith.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {place.helpsWith.map((need) => (
            <span
              key={need}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                matches.includes(need) ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {need}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

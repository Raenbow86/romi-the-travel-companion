"use client";

import { comboBadge } from "@/lib/needs";
import type { CardPlace } from "../data";
import { useRomi } from "../RomiContext";
import { Eyebrow, GOOGLE_EDGE, Shell, StatusBadge, VERIFIED_EDGE, card, field, primaryBtn, secondaryBtn } from "../ui";
import { ratingLine, statusLabel } from "./PlaceCard";
import { clipWords, duplicatesReview } from "../text";
import { scoutHighlights } from "../highlights";
import { HighlightsCard, HoursCard } from "../HighlightsCard";

export function PlaceDetail({ place }: { place: CardPlace }) {
  const r = useRomi();
  const status = place.status || "verified";
  const matches = r.matchingNeeds(place.helpsWith || [], place.subChips);
  const combo = comboBadge(matches);
  const saved = r.savedPlaceIds.includes(place.id);
  const romi = r.travelerScore(place.id, place.name);
  const ask = r.latestAsk(place.id);
  const reviews = r.reviewsFor(place.id, place.name);
  // Google leads: the blurb often falls back to the first review, which is quoted in full below.
  const about = duplicatesReview(place.description, place.reviewSnippet) ? "" : place.description;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  return (
    <Shell>
      <button
        type="button"
        onClick={() => r.setExpandedId(null)}
        className="-ml-2 min-h-12 px-2 text-[15px] font-bold text-slate-700"
      >
        ‹ Results
      </button>

      <section className={`${card} mt-1 border-l-[5px] p-5 ${status === "verified" ? VERIFIED_EDGE : GOOGLE_EDGE}`}>
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={status} label={statusLabel(status, ask?.status)} />
          <span className="text-4xl">{place.icon}</span>
        </div>
        <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-slate-900">{place.name}</h1>
        <p className="mt-1 text-sm text-slate-500">📍 {place.area}</p>
        {ratingLine(romi, place) ? (
          <p className="mt-2 text-sm font-semibold text-slate-700">{ratingLine(romi, place)}</p>
        ) : null}
        {combo ? <p className="mt-3 text-sm font-bold text-slate-800">{combo}</p> : null}
        {place.helpsWith && place.helpsWith.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {place.helpsWith.map((need) => (
              <span
                key={need}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                  matches.includes(need) ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {need}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-2">
        <a href={mapsHref} target="_blank" rel="noreferrer" className={`${primaryBtn} text-center`}>
          Directions
        </a>
        {status === "verified" ? (
          <button
            type="button"
            onClick={() =>
              r.setSavedPlaceIds((cur) =>
                cur.includes(place.id) ? cur.filter((id) => id !== place.id) : [...cur, place.id],
              )
            }
            className={secondaryBtn}
          >
            {saved ? "✓ Saved" : "Save"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              void r.startPlaceReport({
                name: place.name,
                area: place.area,
                lat: place.lat,
                lng: place.lng,
                id: place.id,
                hours: place.hours,
                hoursFull: place.hoursFull,
              })
            }
            className={secondaryBtn}
          >
            Scout it
          </button>
        )}
      </div>

      {status === "verified" ? (
        <HighlightsCard
          tone="verified"
          title="SCOUT HIGHLIGHTS"
          chips={scoutHighlights(place)}
          quote={place.description ? clipWords(place.description, 120) : undefined}
          more={[
            { text: place.description || "" },
            { text: place.note ? `🧭 ${place.note}` : "", strong: true },
          ]}
        />
      ) : (
        <HighlightsCard
          tone="google"
          title="GOOGLE REVIEW HIGHLIGHTS"
          chips={place.highlights || []}
          quote={place.quote || (place.reviewSnippet ? clipWords(place.reviewSnippet, 120) : about ? clipWords(about, 120) : undefined)}
          more={[
            { text: place.reviewSnippet ? `“${place.reviewSnippet}”` : "" },
            { text: about && about !== place.quote ? about : "" },
          ]}
        />
      )}

      <HoursCard hours={place.hours} hoursFull={place.hoursFull} />

      {place.website ? (
        <a
          href={place.website}
          target="_blank"
          rel="noreferrer"
          className={`${card} mt-4 block py-4 text-sm font-bold text-slate-800 underline`}
        >
          Website ↗
        </a>
      ) : null}

      {status === "verified" ? (
        <section className={`${card} mt-4`}>
          <Eyebrow>TRAVELERS SAY</Eyebrow>
          <p className="mt-1 text-xs text-slate-500">Stars and a note. No points.</p>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">None yet.</p>
          ) : (
            <>
              <div className="mt-3 flex gap-2">
                {(["recent", "oldest"] as const).map((sort) => (
                  <button
                    key={sort}
                    type="button"
                    onClick={() => r.setReviewSort(sort)}
                    className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${
                      r.reviewSort === sort ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {sort}
                  </button>
                ))}
              </div>
              <ul className="mt-3 space-y-3">
                {reviews.map((rev) => (
                  <li key={rev.id} className="text-sm text-slate-700">
                    <p className="font-bold text-slate-800">
                      {"★".repeat(rev.stars)}
                      {"☆".repeat(5 - rev.stars)}
                      <span className="ml-2 text-xs font-semibold text-slate-500">
                        {new Date(rev.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </p>
                    {rev.text ? <p className="mt-1 leading-5">{rev.text}</p> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-sm font-bold">Your stars</p>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => r.setReviewStars(n)}
                className={`min-h-12 min-w-11 text-3xl ${n <= r.reviewStars ? "text-slate-800" : "text-slate-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={r.reviewText}
            onChange={(e) => r.setReviewText(e.target.value)}
            placeholder="A quick note (optional)"
            className={`${field} mt-2 h-24`}
          />
          <button
            type="button"
            onClick={() => r.addReview(place.id, place.name)}
            disabled={r.reviewStars < 1}
            className={`${primaryBtn} mt-3`}
          >
            Add review
          </button>
          {r.reviewThanks ? <p className="mt-2 text-sm font-semibold text-slate-700">{r.reviewThanks}</p> : null}

          <div className="mt-5 border-t border-slate-100 pt-4">
            {ask?.status === "sent-to-scouts" ? (
              <p className="text-sm font-bold text-slate-700">On the scout list. Waiting on a new look.</p>
            ) : ask?.status === "for-angela" ? (
              <div>
                <p className="text-sm font-bold text-slate-900">For Angela</p>
                <p className="mt-1 text-sm text-slate-700">{ask.reason}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      r.setReverifyAsks((cur) =>
                        cur.map((a) =>
                          a.placeId === place.id && a.status === "for-angela" ? { ...a, status: "sent-to-scouts" } : a,
                        ),
                      )
                    }
                    className={primaryBtn}
                  >
                    Send to scouts
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      r.setReverifyAsks((cur) =>
                        cur.map((a) =>
                          a.placeId === place.id && a.status === "for-angela" ? { ...a, status: "keep" } : a,
                        ),
                      )
                    }
                    className={secondaryBtn}
                  >
                    Keep it
                  </button>
                </div>
              </div>
            ) : r.reverifyOpen ? (
              <div>
                <p className="text-sm font-bold">What changed?</p>
                <textarea
                  value={r.reverifyReason}
                  onChange={(e) => r.setReverifyReason(e.target.value)}
                  className={`${field} mt-2 h-24`}
                />
                <button
                  type="button"
                  onClick={() => r.askReverify(place.id, place.name)}
                  disabled={!r.reverifyReason.trim()}
                  className={`${primaryBtn} mt-2`}
                >
                  Send to Angela
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => r.setReverifyOpen(true)}
                className="min-h-12 w-full text-center text-sm font-semibold text-slate-500"
              >
                Something changed? Ask a scout to re-check
              </button>
            )}
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => {
            r.setFlaggedPlaces((current) =>
              current.some((f) => f.id === place.id)
                ? current
                : [{ id: place.id, name: place.name, needs: r.selectedNeeds }, ...current],
            );
            if (r.highlightedId === place.id) r.setHighlightedId(null);
          }}
          className="mt-4 min-h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-500"
        >
          Doesn’t belong in this list
        </button>
      )}
    </Shell>
  );
}

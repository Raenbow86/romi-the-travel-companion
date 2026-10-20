"use client";

import { useState, type ReactNode } from "react";
import { needs } from "../data";
import { useRomi } from "../RomiContext";
import { Eyebrow, Shell, card, chip, dropdown, field, primaryBtn, secondaryBtn } from "../ui";

const STEPS = 4;

function Choice({
  legend,
  options,
  value,
  onPick,
  label = (o: string) => o,
}: {
  legend: string;
  options: readonly string[];
  value: string;
  onPick: (o: string) => void;
  label?: (o: string) => string;
}) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold text-slate-900">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onPick(opt)} className={`${chip(value === opt)} capitalize`}>
            {label(opt)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Title({ children, sub }: { children: ReactNode; sub: string }) {
  return (
    <>
      <Eyebrow>SCOUT A PLACE</Eyebrow>
      <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">{children}</h1>
      <p className="mt-1 text-[15px] text-slate-500">{sub}</p>
    </>
  );
}

export function ScoutWizard() {
  const r = useRomi();
  const [step, setStep] = useState(1);
  const [showReports, setShowReports] = useState(false);

  function next() {
    if (step === 1 && (!r.reportName.trim() || !r.reportArea.trim())) {
      r.setFormError("Need the place name and the town.");
      return;
    }
    r.setFormError("");
    setStep((s) => Math.min(STEPS, s + 1));
  }

  return (
    <Shell>
      <div className="flex min-h-12 items-center justify-between">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="-ml-2 min-h-12 px-2 font-bold text-slate-700">
            ‹ Back
          </button>
        ) : (
          <span />
        )}
        <span className="text-sm font-bold text-slate-500">
          Step {step} of {STEPS}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: STEPS }, (_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-slate-800" : "bg-slate-200"}`} />
        ))}
      </div>

      {r.justSaved && step === 1 ? (
        <p className={`${card} mt-5 text-sm font-semibold text-slate-700`}>
          Sent {r.justSaved.name}. Pending Angela’s review — not teal yet. +{r.justSaved.points} points
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          if (step < STEPS) {
            e.preventDefault();
            next();
            return;
          }
          void r.savePlaceReport(e).then((ok) => {
            if (ok) setStep(1);
          });
        }}
        className="mt-7"
      >
        {step === 1 && (
          <div className="space-y-5">
            <Title sub="Just the name and town. Details come next.">
              Where did
              <br />
              you stop?
            </Title>
            <label className="relative block">
              <Eyebrow>PLACE NAME</Eyebrow>
              <input
                value={r.reportName}
                onChange={(e) => {
                  r.setNameLocked(false);
                  r.setReportName(e.target.value);
                }}
                onFocus={() => r.setNameFocused(true)}
                onBlur={() => window.setTimeout(() => r.setNameFocused(false), 220)}
                placeholder="e.g. Love’s Travel Stop"
                autoComplete="off"
                className={`${field} mt-2 ${r.nameLocked ? "border-2 border-slate-800" : ""}`}
              />
              {r.nameFocused && !r.nameLocked && r.placeHits.length > 0 && (
                <div className={dropdown}>
                  {r.placeHits.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      onClick={() => void r.pickPlaceHit(hit)}
                      className="block w-full border-b border-slate-100 px-4 py-3.5 text-left last:border-0"
                    >
                      <p className="font-bold text-slate-900">{hit.name}</p>
                      <p className={`text-xs ${hit.gold ? "text-teal-700" : "text-orange-700"}`}>
                        {hit.gold ? "Scout verified · " : "Google · "}
                        <span className="text-slate-500">{hit.area}</span>
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </label>
            <label className="relative block">
              <Eyebrow>TOWN</Eyebrow>
              <input
                value={r.reportArea}
                onChange={(e) => {
                  r.setTownLocked(false);
                  r.setReportArea(e.target.value);
                }}
                onFocus={() => r.setTownFocused(true)}
                onBlur={() => window.setTimeout(() => r.setTownFocused(false), 220)}
                placeholder="e.g. Moab, UT"
                autoComplete="off"
                className={`${field} mt-2`}
              />
              {r.townFocused && !r.townLocked && r.townHits.length > 0 && (
                <div className={dropdown}>
                  {r.townHits.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      onClick={() => void r.pickTownHit(hit)}
                      className="block w-full border-b border-slate-100 px-4 py-3.5 text-left last:border-0"
                    >
                      <p className="font-bold text-slate-900">{hit.name}</p>
                      <p className="text-xs text-slate-500">{hit.area}</p>
                    </button>
                  ))}
                </div>
              )}
            </label>
            <button type="button" onClick={r.pinHere} className={secondaryBtn}>
              {r.pinStatus === "pinning"
                ? "Finding you…"
                : r.pinLat != null && r.pinLng != null
                  ? `📍 Pinned · ${r.pinLat.toFixed(4)}, ${r.pinLng.toFixed(4)}`
                  : "📍 Use where I am now"}
            </button>
            {r.pinStatus === "denied" ? (
              <p className="text-sm text-slate-500">Location was blocked — pick the place from the list instead.</p>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Title sub="Tap everything it actually helped with.">What did it help with?</Title>
            <div className="flex flex-wrap gap-2">
              {needs.map((need) => {
                const on = r.reportNeeds.includes(need.label);
                return (
                  <button
                    key={need.label}
                    type="button"
                    onClick={() =>
                      r.setReportNeeds((cur) => (on ? cur.filter((n) => n !== need.label) : [...cur, need.label]))
                    }
                    className={chip(on)}
                  >
                    {need.icon} {need.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Title sub="Quick taps. Skip what you didn’t notice.">The practical stuff</Title>
            <Choice
              legend="I was there"
              options={["yes", "no"]}
              value={r.beenThere}
              onPick={r.setBeenThere}
              label={(o) => (o === "yes" ? "Yes — I went" : "No")}
            />
            <Choice legend="Pull-through" options={["yes", "tight", "no", "unsure"]} value={r.pullThrough} onPick={r.setPullThrough} />
            <Choice legend="Dogs" options={["yes", "leash", "no", "unsure"]} value={r.reportDogs} onPick={r.setReportDogs} />
            <fieldset>
              <legend className="text-[15px] font-bold text-slate-900">Hours</legend>
              {r.googleHours ? (
                <>
                  <p className={`${card} mt-2 whitespace-pre-line text-sm text-slate-700`}>{r.googleHours}</p>
                  <p className="mt-3 text-sm font-bold">Are these hours right?</p>
                  <div className="mt-2 flex gap-2">
                    {(["yes", "no"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          r.setHoursOk(opt);
                          r.setHoursSeen(r.googleHours);
                        }}
                        className={`${chip(r.hoursOk === opt)} capitalize`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {r.hoursOk === "no" ? (
                    <textarea value={r.hoursSeen} onChange={(e) => r.setHoursSeen(e.target.value)} className={`${field} mt-3 h-28`} />
                  ) : null}
                </>
              ) : (
                <textarea
                  value={r.hoursSeen}
                  onChange={(e) => r.setHoursSeen(e.target.value)}
                  placeholder="What was open when you were there"
                  className={`${field} mt-2 h-24`}
                />
              )}
            </fieldset>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <Title sub="Last step. Notes are optional but earn extra points.">Anything else?</Title>
            <Choice legend="Would you go back?" options={["yes", "maybe", "no"]} value={r.returnAgain} onPick={r.setReturnAgain} />
            <label className="block">
              <span className="text-[15px] font-bold text-slate-900">Notes</span>
              <textarea
                value={r.reportNotes}
                onChange={(e) => r.setReportNotes(e.target.value)}
                placeholder="What it was actually like"
                className={`${field} mt-2 h-28`}
              />
            </label>
            <fieldset>
              <legend className="text-[15px] font-bold text-slate-900">Google had this wrong?</legend>
              <button type="button" onClick={() => r.setGoogleWrong((v) => !v)} className={`${chip(r.googleWrong)} mt-2`}>
                {r.googleWrong ? "Flagged — doesn’t belong" : "Flag it"}
              </button>
            </fieldset>
          </div>
        )}

        {r.formError ? <p className="mt-4 text-sm font-semibold text-slate-800">⚠️ {r.formError}</p> : null}
        <button type="submit" className={`${primaryBtn} mt-8`}>
          {step < STEPS ? "Next" : "Send scout report"}
        </button>
      </form>

      {step === 1 && (r.travelerReports.length > 0 || r.flaggedPlaces.length > 0) ? (
        <div className="mt-8 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setShowReports((v) => !v)}
            className="min-h-12 w-full text-left text-[15px] font-bold text-slate-700"
          >
            {showReports ? "▾" : "▸"} Your reports ({r.travelerReports.length})
            {r.flaggedPlaces.length ? ` · Flagged (${r.flaggedPlaces.length})` : ""}
          </button>
          {showReports && (
            <div className="mt-2 space-y-3">
              {r.travelerReports.map((report, i) => (
                <article key={report.id || `${report.name}-${i}`} className={card}>
                  <Eyebrow>PENDING REVIEW</Eyebrow>
                  <h3 className="mt-1 font-extrabold">{report.name}</h3>
                  <p className="text-sm text-slate-500">📍 {report.area}</p>
                  {report.helpsWith?.length ? <p className="mt-1 text-xs text-slate-500">{report.helpsWith.join(" · ")}</p> : null}
                  {report.notes ? <p className="mt-2 text-sm text-slate-700">{report.notes}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">
                    Go back: {report.returnAgain || "—"} · Dogs: {report.dogFriendly || "—"} · Pull-through:{" "}
                    {report.pullThrough || "—"}
                  </p>
                </article>
              ))}
              {r.flaggedPlaces.length > 0 && (
                <>
                  <p className="pt-2 text-sm text-slate-500">Flagged as wrong — hidden from Find. Undo if you tapped by mistake.</p>
                  {r.flaggedPlaces.map((flag) => (
                    <article key={flag.id} className={card}>
                      <h3 className="font-extrabold">{flag.name}</h3>
                      <p className="text-sm text-slate-500">{flag.needs.length ? flag.needs.join(" + ") : "Doesn’t belong"}</p>
                      <button
                        type="button"
                        onClick={() => r.setFlaggedPlaces((current) => current.filter((f) => f.id !== flag.id))}
                        className="mt-1 min-h-11 text-sm font-bold text-slate-800 underline"
                      >
                        Undo flag
                      </button>
                    </article>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Shell>
  );
}

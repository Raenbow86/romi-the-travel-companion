"use client";

import { useState } from "react";
import { highlightIcon } from "./highlights";
import { Eyebrow, card } from "./ui";

/** One highlight card for BOTH scout-verified places and Google leads: neutral chips + short quote + Read more. */
export function HighlightsCard({
  title,
  chips,
  quote,
  more,
}: {
  title: string;
  chips: string[];
  quote?: string;
  more?: Array<{ text: string; strong?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const extra = (more || []).filter((m) => m.text && m.text !== quote);
  if (!chips.length && !quote && !extra.length) return null;
  return (
    <section className={`${card} mt-4`} data-testid="highlights">
      {chips.length > 0 ? (
        <>
          <Eyebrow>{title}</Eyebrow>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 ring-[1.5px] ring-slate-200"
              >
                {highlightIcon(c)} {c}
              </span>
            ))}
          </div>
        </>
      ) : null}
      {quote ? (
        <p className={`${chips.length ? "mt-3" : ""} border-l-[3px] border-slate-200 pl-3 text-[15px] leading-6 text-slate-700`}>
          “{quote}”
        </p>
      ) : null}
      {extra.length > 0 ? (
        <>
          {open
            ? extra.map((m, i) => (
                <p
                  key={i}
                  className={`mt-3 text-[15px] leading-6 ${m.strong ? "font-semibold text-slate-800" : "text-slate-700"}`}
                >
                  {m.text}
                </p>
              ))
            : null}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 min-h-11 text-sm font-bold text-slate-800 underline"
          >
            {open ? "Show less" : "Read more"}
          </button>
        </>
      ) : null}
    </section>
  );
}

/** "Open today 3 PM–12 AM" from the weekly list when possible, else the API's today string. */
export function todayHoursLabel(hours?: string, hoursFull?: string, now = new Date()) {
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const line = (hoursFull || "").split("\n").find((l) => l.toLowerCase().startsWith(day.toLowerCase()));
  const t = line ? line.replace(/^[^:]+:\s*/, "").trim() : "";
  if (t) return /closed/i.test(t) ? "Closed today" : /24 hours/i.test(t) ? "Open 24 hours today" : `Open today ${t}`;
  return hours || "";
}

export function HoursCard({ hours, hoursFull }: { hours?: string; hoursFull?: string }) {
  const [open, setOpen] = useState(false);
  const label = todayHoursLabel(hours, hoursFull);
  if (!label && !hoursFull) return null;
  return (
    <section className={`${card} mt-4 py-3`}>
      <button
        type="button"
        disabled={!hoursFull}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between text-left text-[15px] font-bold text-slate-900"
        aria-expanded={open}
      >
        <span>🕒 {label || "Hours"}</span>
        {hoursFull ? <span className="text-slate-500">{open ? "▴" : "▾"}</span> : null}
      </button>
      {open && hoursFull ? <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{hoursFull}</p> : null}
    </section>
  );
}

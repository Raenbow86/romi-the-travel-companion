"use client";

import { useRomi } from "../RomiContext";
import { Eyebrow, Shell, card } from "../ui";

export function SavedScreen() {
  const { savedDays, openDay } = useRomi();
  return (
    <Shell>
      <Eyebrow>SAVED</Eyebrow>
      <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-slate-900">Your plans</h1>
      <p className="mt-1 text-[15px] text-slate-500">Open a saved day. You’ll only see that plan.</p>
      {savedDays.length === 0 ? (
        <p className={`${card} mt-6 text-sm text-slate-600`}>No plans yet — save one from Find.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {savedDays.map((day) => (
            <button key={day.id} type="button" onClick={() => openDay(day)} className={`${card} block w-full p-5 text-left`}>
              <p className="text-lg font-extrabold text-slate-900">{day.name}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                📍 {day.location}
                {day.needs.length ? ` · ${day.needs.join(" + ")}` : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </Shell>
  );
}

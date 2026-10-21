"use client";

import type { ReactNode } from "react";
import { useRomi } from "./RomiContext";
import type { Screen } from "./data";

// Brand rule: teal = scout-verified, orange = Google lead. Nothing else uses them.
// Sun-readable shades: teal-700 (#0f766e) and orange-700 (#c2410c). Map pins use the same hex values.
export const VERIFIED_HEX = "#0f766e";
export const GOOGLE_HEX = "#c2410c";
/** Verified: thick teal edge + soft teal tint. Google: thin orange edge on plain white. */
export const VERIFIED_EDGE = "border-l-[6px] border-l-teal-700 bg-teal-50!";
export const GOOGLE_EDGE = "border-l-[3px] border-l-orange-700 bg-white";

export const card = "rounded-[22px] bg-white p-4 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.18)]";
export const field =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-800 outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-300";
export const primaryBtn =
  "w-full rounded-2xl bg-slate-800 px-5 py-4 text-base font-bold text-white shadow-sm active:bg-slate-900 disabled:opacity-40";
export const secondaryBtn =
  "w-full rounded-2xl border-2 border-slate-800 bg-white px-5 py-3.5 text-base font-bold text-slate-800 disabled:opacity-40";
export const dropdown =
  "absolute left-0 right-0 z-[200] mt-1 max-h-72 overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200";

export function chip(on: boolean) {
  return `min-h-12 rounded-full px-4 py-3 text-[15px] font-semibold transition ${
    on ? "bg-slate-800 text-white" : "bg-white text-slate-700 ring-[1.5px] ring-slate-200"
  }`;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-extrabold tracking-[0.16em] text-slate-500">{children}</p>;
}

export function StatusBadge({ status, label }: { status: "verified" | "google"; label: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-[0.08em] ${
        status === "verified"
          ? "bg-teal-700 text-white"
          : "bg-white py-[3px] text-orange-800 ring-[1.5px] ring-inset ring-orange-700"
      }`}
    >
      {status === "verified" ? "✓ " : ""}
      {label}
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#faf8f4] px-5 pb-32 pt-6 text-slate-800">
      <div className="mx-auto max-w-md">{children}</div>
      <BottomNav />
    </main>
  );
}

export function BottomNav() {
  const { screen, setScreen, setViewingSavedDay, setHomeView, setExpandedId } = useRomi();
  const items: Array<{ id: Screen; label: string; icon: string }> = [
    { id: "home", label: "Find", icon: "🧭" },
    { id: "saved", label: "Saved", icon: "🔖" },
    { id: "report", label: "Scout", icon: "🧑‍🚀" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[500] border-t border-slate-100 bg-white/95 px-2 pb-5 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {items.map((item) => {
          const on = screen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "home") {
                  setViewingSavedDay(null);
                  if (screen === "home") {
                    setHomeView("find");
                    setExpandedId(null);
                  }
                }
                setScreen(item.id);
              }}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-bold ${
                on ? "text-slate-900" : "text-slate-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
              {on ? <span className="mt-1 h-1 w-6 rounded-full bg-slate-800" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useRef } from "react";

export type MapStop = {
  id: string;
  name: string;
  area: string;
  icon: string;
  lat: number;
  lng: number;
};

function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { L?: unknown }).L) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const cssId = "romi-leaflet-css";
    if (!document.getElementById(cssId)) {
      const css = document.createElement("link");
      css.id = cssId;
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
    }

    if (!document.getElementById("romi-pin-style")) {
      const style = document.createElement("style");
      style.id = "romi-pin-style";
      style.textContent = `
        .romi-pin { background: transparent !important; border: none !important; }
        .romi-pin-face {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #fff7ed;
          border: 3px solid #0f766e;
          display: grid;
          place-items: center;
          font-size: 24px;
          line-height: 1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.28);
        }
      `;
      document.head.appendChild(style);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Map failed to load"));
    document.body.appendChild(script);
  });
}

export function RomiMap({
  stops,
  onSelect,
}: {
  stops: MapStop[];
  onSelect: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  const key = stops.map((s) => `${s.id}:${s.icon}`).join("|");

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!el.current || stops.length === 0) return;
      await loadLeaflet();
      if (cancelled || !el.current) return;

      const L = (window as unknown as { L: LeafletLike }).L;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(el.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const points = stops.map((stop) => {
        const picture = L.divIcon({
          className: "romi-pin",
          html: `<div class="romi-pin-face">${stop.icon}</div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -22],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: picture }).addTo(map);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`;
        marker.bindPopup(
          `<strong>${stop.name}</strong><br/>${stop.area}<br/><a href="${mapsUrl}" target="_blank" rel="noreferrer">Open in Maps</a>`,
        );
        marker.on("click", () => selectRef.current(stop.id));
        return [stop.lat, stop.lng] as [number, number];
      });

      map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 12 });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 80);
    }

    void boot();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (stops.length === 0) return null;

  return (
    <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-amber-100">
      <p className="px-5 pt-4 text-xs font-bold tracking-[0.16em] text-orange-700">
        MAP
      </p>
      <h3 className="px-5 text-2xl font-black text-slate-900">Tap a picture</h3>
      <p className="px-5 pb-3 text-sm text-slate-600">
        Each pin is the thing itself — bread, wine, tent, burger. Tap it for the
        card, or Open in Maps for directions.
      </p>
      <div ref={el} className="h-72 w-full" />
    </section>
  );
}

type LeafletLike = {
  map: (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => {
    remove: () => void;
    invalidateSize: () => void;
    fitBounds: (b: unknown, o: unknown) => void;
  };
  tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (m: unknown) => void };
  marker: (
    latlng: [number, number],
    opts: Record<string, unknown>,
  ) => LeafletMarker & { addTo: (m: unknown) => LeafletMarker };
  divIcon: (opts: Record<string, unknown>) => unknown;
  latLngBounds: (pts: [number, number][]) => unknown;
};

type LeafletMarker = {
  bindPopup: (html: string) => void;
  on: (event: string, fn: () => void) => void;
};

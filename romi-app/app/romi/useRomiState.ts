"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { coverage, needsFromText, pickedSubChips } from "@/lib/needs";
import {
  Origin,
  NearbyPlace,
  PlaceReview,
  ReverifyAsk,
  SavedDay,
  Screen,
  TravelerReport,
  compactName,
  isSamePlace,
  milesBetween,
  realStops,
} from "./data";
import { createLatestGuard, dropSubChipsOf, type SearchArea } from "./searchState";

export type HomeView = "find" | "results";

// All Romi state and handlers, moved verbatim from the old single-file page.
// Filtering still goes only through lib/needs.ts (coverage / pickedSubChips / needsFromText).
export function useRomiState() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [locationDraft, setLocationDraft] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");
  const [briefDraft, setBriefDraft] = useState("");
  const [refinements, setRefinements] = useState<string[]>([]);
  const [romiReply, setRomiReply] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; area: string }>>([]);
  const [areaSuggestions, setAreaSuggestions] = useState<Array<{ id: string; name: string; area: string }>>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [searchPlaces, setSearchPlaces] = useState<NearbyPlace[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nearbyStatus, setNearbyStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "ready">("idle");
  // Origin + radius of the nearby search whose results are on screen (caption, radius filter and cards all use this).
  const [resultsArea, setResultsArea] = useState<SearchArea | null>(null);
  const nearbyGuard = useRef(createLatestGuard());
  const searchGuard = useRef(createLatestGuard());
  const [geoStatus, setGeoStatus] = useState("");

  const [travelerReports, setTravelerReports] = useState<TravelerReport[]>([]);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [savedDays, setSavedDays] = useState<SavedDay[]>([]);
  const [flaggedPlaces, setFlaggedPlaces] = useState<Array<{ id: string; name: string; needs: string[] }>>([]);
  const [scoutPoints, setScoutPoints] = useState(0);
  const [viewingSavedDay, setViewingSavedDay] = useState<SavedDay | null>(null);
  const [dayName, setDayName] = useState("");

  const [reportName, setReportName] = useState("");
  const [reportArea, setReportArea] = useState("");
  const [reportNeeds, setReportNeeds] = useState<string[]>([]);
  const [reportNotes, setReportNotes] = useState("");
  const [returnAgain, setReturnAgain] = useState("");
  const [beenThere, setBeenThere] = useState("yes");
  const [pullThrough, setPullThrough] = useState("unsure");
  const [reportDogs, setReportDogs] = useState("unsure");
  const [hoursSeen, setHoursSeen] = useState("");
  const [googleHours, setGoogleHours] = useState("");
  const [hoursOk, setHoursOk] = useState<"" | "yes" | "no">("");
  const [justSaved, setJustSaved] = useState<{ name: string; points: number } | null>(null);
  const [formError, setFormError] = useState("");
  const [placeReviews, setPlaceReviews] = useState<PlaceReview[]>([]);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewThanks, setReviewThanks] = useState("");
  const [reviewSort, setReviewSort] = useState<"recent" | "oldest">("recent");
  const [reverifyAsks, setReverifyAsks] = useState<ReverifyAsk[]>([]);
  const [reverifyReason, setReverifyReason] = useState("");
  const [reverifyOpen, setReverifyOpen] = useState(false);
  const [googleWrong, setGoogleWrong] = useState(false);
  const [pinStatus, setPinStatus] = useState<"idle" | "pinning" | "pinned" | "denied">("idle");
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [townHits, setTownHits] = useState<Array<{ id: string; name: string; area: string }>>([]);
  const [placeHits, setPlaceHits] = useState<
    Array<{ id: string; name: string; area: string; gold?: boolean; lat?: number; lng?: number }>
  >([]);
  const [nameFocused, setNameFocused] = useState(false);
  const [townFocused, setTownFocused] = useState(false);
  const [nameLocked, setNameLocked] = useState(false);
  const [townLocked, setTownLocked] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(15);
  const [homeView, setHomeView] = useState<HomeView>("find");
  const radiusMeters = Math.round(radiusMiles * 1609);

  useEffect(() => {
    try {
      const savedReports = window.localStorage.getItem("romi-traveler-reports");
      if (savedReports) {
        const parsed = JSON.parse(savedReports);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing effect logic, kept as-is to avoid behavior change
        if (Array.isArray(parsed)) setTravelerReports(parsed);
      }
      const savedPlaces = window.localStorage.getItem("romi-saved-places");
      if (savedPlaces) {
        const parsed = JSON.parse(savedPlaces);
        if (Array.isArray(parsed)) setSavedPlaceIds(parsed);
      }
      const savedDayRaw = window.localStorage.getItem("romi-saved-days");
      if (savedDayRaw) {
        const parsed = JSON.parse(savedDayRaw);
        if (Array.isArray(parsed)) setSavedDays(parsed);
      }
      const pointsRaw = window.localStorage.getItem("romi-scout-points");
      if (pointsRaw) {
        const n = Number(pointsRaw);
        if (!Number.isNaN(n)) setScoutPoints(n);
      }
      const flagsRaw = window.localStorage.getItem("romi-flagged-places");
      if (flagsRaw) {
        const parsed = JSON.parse(flagsRaw);
        if (Array.isArray(parsed)) setFlaggedPlaces(parsed);
      }
      const reviewsRaw = window.localStorage.getItem("romi-place-reviews");
      if (reviewsRaw) {
        const parsed = JSON.parse(reviewsRaw);
        if (Array.isArray(parsed)) setPlaceReviews(parsed);
      }
      const reverifyRaw = window.localStorage.getItem("romi-reverify-asks");
      if (reverifyRaw) {
        const parsed = JSON.parse(reverifyRaw);
        if (Array.isArray(parsed)) setReverifyAsks(parsed);
      }
      const originRaw = window.localStorage.getItem("romi-origin");
      if (originRaw) {
        const parsed = JSON.parse(originRaw) as Origin;
        if (parsed?.lat && parsed?.lng) {
          setOrigin(parsed);
          setLocationDraft(parsed.label);
        }
      }
    } catch {
      // ignore
    }
    setHasLoadedReports(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedReports) return;
    try {
      window.localStorage.setItem("romi-traveler-reports", JSON.stringify(travelerReports));
      window.localStorage.setItem("romi-saved-places", JSON.stringify(savedPlaceIds));
      window.localStorage.setItem("romi-saved-days", JSON.stringify(savedDays));
      window.localStorage.setItem("romi-scout-points", String(scoutPoints));
      window.localStorage.setItem("romi-flagged-places", JSON.stringify(flaggedPlaces));
      window.localStorage.setItem("romi-place-reviews", JSON.stringify(placeReviews));
      window.localStorage.setItem("romi-reverify-asks", JSON.stringify(reverifyAsks));
      if (origin) window.localStorage.setItem("romi-origin", JSON.stringify(origin));
    } catch {
      // ignore
    }
  }, [travelerReports, savedPlaceIds, savedDays, scoutPoints, origin, flaggedPlaces, placeReviews, reverifyAsks, hasLoadedReports]);

  useEffect(() => {
    if (!origin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing effect logic, kept as-is to avoid behavior change
      setNearbyPlaces([]);
      return;
    }
    const reqId = nearbyGuard.current.start();
    const controller = new AbortController();
    const area: SearchArea = { ...origin, radiusMiles };
    setNearbyStatus("loading");
    const params = new URLSearchParams({
      area: origin.label,
      needs: selectedNeeds.join(","),
      lat: String(origin.lat),
      lng: String(origin.lng),
      radius: String(radiusMeters),
      exclude: realStops.map((s) => s.name).join("|"),
    });
    if (refinements.length) params.set("extra", refinements.join(","));
    const apply = (places: NearbyPlace[]) => {
      if (controller.signal.aborted || !nearbyGuard.current.isLatest(reqId)) return; // stale response
      setNearbyPlaces(places);
      setResultsArea(area);
      setNearbyStatus("ready");
    };
    fetch(`/api/nearby?${params.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { places?: NearbyPlace[] }) => apply(data.places || []))
      .catch(() => apply([]));
    return () => controller.abort();
  }, [origin, selectedNeeds, refinements, radiusMiles, radiusMeters]);

  useEffect(() => {
    const q = placeSearch.trim();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing effect logic, kept as-is to avoid behavior change
      setSuggestions([]);
      setSearchPlaces([]);
      setSearchStatus("idle");
      return;
    }
    const gold = realStops
      .filter((stop) => {
        const hay = compactName(`${stop.name} ${stop.area}`);
        return hay.includes(compactName(q)) || compactName(q).includes(compactName(stop.name));
      })
      .map((stop) => ({ id: stop.id, name: stop.name, area: stop.area }));
    const reqId = searchGuard.current.start();
    const controller = new AbortController();
    setSearchStatus("loading");
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q });
      if (origin) {
        params.set("lat", String(origin.lat));
        params.set("lng", String(origin.lng));
        params.set("radius", "80000");
      }
      fetch(`/api/autocomplete?${params.toString()}`)
        .then((r) => r.json())
        .then((data: { predictions?: Array<{ id: string; name: string; area: string }> }) => {
          const google = data.predictions || [];
          const merged = [
            ...gold,
            ...google.filter((g) => !gold.some((x) => isSamePlace(x.name, g.name))),
          ];
          setSuggestions(merged.slice(0, 8));
        })
        .catch(() => setSuggestions(gold));

      const apply = (places: NearbyPlace[]) => {
        if (controller.signal.aborted || !searchGuard.current.isLatest(reqId)) return; // stale response
        setSearchPlaces(places);
        setSearchStatus("ready");
      };
      fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data: { places?: NearbyPlace[] }) => apply(data.places || []))
        .catch(() => apply([]));
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [placeSearch, origin]);

  useEffect(() => {
    const q = locationDraft.trim();
    if (q.length < 2 || (origin && q === origin.label)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing effect logic, kept as-is to avoid behavior change
      setAreaSuggestions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      fetch(`/api/autocomplete?q=${encodeURIComponent(q)}&types=${encodeURIComponent("(cities)")}`)
        .then((r) => r.json())
        .then((data: { predictions?: Array<{ id: string; name: string; area: string }> }) => {
          setAreaSuggestions(data.predictions || []);
        })
        .catch(() => setAreaSuggestions([]));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [locationDraft, origin]);

  useEffect(() => {
    const q = reportArea.trim();
    if (townLocked || !townFocused || q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing effect logic, kept as-is to avoid behavior change
      if (townLocked || !townFocused) setTownHits([]);
      if (q.length < 2) setTownHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      fetch(
        `/api/autocomplete?q=${encodeURIComponent(q)}&types=${encodeURIComponent("(cities)")}`,
      )
        .then((r) => r.json())
        .then((data: { predictions?: Array<{ id: string; name: string; area: string }> }) => {
          setTownHits(data.predictions || []);
        })
        .catch(() => setTownHits([]));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [reportArea, townLocked, townFocused]);

  useEffect(() => {
    const q = reportName.trim();
    if (nameLocked || !nameFocused || q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing effect logic, kept as-is to avoid behavior change
      setPlaceHits([]);
      return;
    }
    const gold = realStops
      .filter((stop) => compactName(`${stop.name} ${stop.area}`).includes(compactName(q)))
      .map((stop) => ({
        id: stop.id,
        name: stop.name,
        area: stop.area,
        gold: true as const,
        lat: stop.lat,
        lng: stop.lng,
      }));
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q, types: "establishment" });
      if (origin) {
        params.set("lat", String(origin.lat));
        params.set("lng", String(origin.lng));
        params.set("radius", "80000");
      }
      fetch(`/api/autocomplete?${params.toString()}`)
        .then((r) => r.json())
        .then((data: { predictions?: Array<{ id: string; name: string; area: string }> }) => {
          const google = (data.predictions || []).map((g) => ({ ...g, gold: false as const }));
          const merged = [
            ...gold,
            ...google.filter((g) => !gold.some((x) => isSamePlace(x.name, g.name))),
          ];
          setPlaceHits(merged.slice(0, 8));
        })
        .catch(() => setPlaceHits(gold));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [reportName, origin, nameLocked, nameFocused]);

  // One filter for list, cards and pins: OR across needs, sub-chips narrow a need.
  const pickedSubs = pickedSubChips(selectedNeeds, refinements);

  function matchingNeeds(placeNeeds: string[], placeSubs: string[] = []) {
    return coverage({ helpsWith: placeNeeds, subChips: placeSubs }, selectedNeeds, pickedSubs);
  }

  // Until the first nearby search lands, fall back to the live origin/radius.
  const appliedArea: SearchArea | null = resultsArea ?? (origin ? { ...origin, radiusMiles } : null);
  const isSearching = !!origin && (nearbyStatus !== "ready" || searchStatus === "loading");

  function inRadius(stop: { lat: number; lng: number }) {
    if (!origin || !appliedArea) return false;
    return milesBetween(appliedArea, stop) <= appliedArea.radiusMiles;
  }

  // Display only: distance shown on cards.
  function milesFromOrigin(stop: { lat: number; lng: number }) {
    return origin ? milesBetween(origin, stop) : 0;
  }

  function verifiedHere() {
    if (!origin) return [];
    return realStops
      .filter((stop) => inRadius(stop))
      .filter((stop) =>
        selectedNeeds.length === 0
          ? true
          : matchingNeeds(stop.helpsWith).length > 0,
      )
      .sort((a, b) => matchingNeeds(b.helpsWith).length - matchingNeeds(a.helpsWith).length);
    // Gold stops carry no sub-chip data yet, so a picked sub-chip (e.g. Vet) hides them for that need.
  }

  function googleLeads() {
    const pool = placeSearch.trim().length >= 2 ? searchPlaces : nearbyPlaces;
    const flagged = new Set(flaggedPlaces.map((f) => f.id));
    return pool
      .filter((place) => !flagged.has(place.id))
      .filter((place) => !realStops.some((stop) => isSamePlace(stop.name, place.name)))
      .filter((place) => inRadius(place))
      .filter((place) => {
        // A place with no helpsWith never passes a chip filter.
        if (selectedNeeds.length === 0) return true;
        return matchingNeeds(place.helpsWith || [], place.subChips).length > 0;
      })
      .sort(
        (a, b) =>
          matchingNeeds(b.helpsWith || [], b.subChips).length -
          matchingNeeds(a.helpsWith || [], a.subChips).length,
      )
      .slice(0, 8);
  }

  function allCards() {
    if (viewingSavedDay?.placeIds.length) {
      return realStops.filter((s) => viewingSavedDay.placeIds.includes(s.id));
    }
    const q = placeSearch.trim();
    const namedGold =
      q.length >= 2
        ? realStops.filter((s) => compactName(`${s.name} ${s.area}`).includes(compactName(q)))
        : [];
    const verified = [
      ...namedGold,
      ...verifiedHere().filter((s) => !namedGold.some((g) => g.id === s.id)),
    ];
    return [
      ...verified.map((s) => ({ ...s, status: "verified" as const })),
      ...googleLeads().map((s) => ({ ...s, status: "google" as const })),
    ];
  }

  function mapStops() {
    return allCards()
      .filter((s) => typeof s.lat === "number")
      .map((s) => ({
        id: s.id,
        name: s.name,
        area: s.area,
        icon: s.icon,
        lat: s.lat,
        lng: s.lng,
        kind: "status" in s && s.status === "google" ? ("google" as const) : ("verified" as const),
      }));
  }

  function selectedCard() {
    return allCards().find((s) => s.id === highlightedId) || null;
  }

  async function applyOrigin(label: string, lat: number, lng: number) {
    const next = { label, lat, lng };
    setOrigin(next);
    setLocationDraft(label);
    setViewingSavedDay(null);
    setHighlightedId(null);
    setExpandedId(null);
  }

  async function geocodeDraft(event?: FormEvent) {
    event?.preventDefault();
    const q = locationDraft.trim();
    if (!q) return;
    setGeoStatus("Finding that area…");
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.lat) {
      await applyOrigin(data.label || q, data.lat, data.lng);
      setGeoStatus("");
    } else {
      setGeoStatus("Couldn’t find that place. Try a city name.");
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("This browser won’t share location.");
      return;
    }
    setGeoStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
        const data = await res.json();
        await applyOrigin(data.label || "Near you", latitude, longitude);
        setGeoStatus("");
      },
      () => setGeoStatus("Location was blocked. Type a city instead."),
    );
  }

  async function pickSuggestion(id: string, name: string) {
    setPlaceSearch(name);
    setSuggestions([]);
    const gold = realStops.find((s) => s.id === id || isSamePlace(s.name, name));
    if (gold) {
      setHighlightedId(gold.id);
      setExpandedId(gold.id);
      if (!origin) await applyOrigin(gold.area, gold.lat, gold.lng);
      return;
    }
    const res = await fetch(`/api/place?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (data.place) {
      setSearchPlaces((current) => {
        const next = current.filter((p) => p.id !== data.place.id);
        return [data.place, ...next];
      });
      setHighlightedId(data.place.id);
      setExpandedId(data.place.id);
    }
  }

  async function pickTownHit(hit: { id: string; name: string; area: string }) {
    const label = hit.area.toLowerCase().includes(hit.name.toLowerCase())
      ? hit.area
      : `${hit.name}, ${hit.area}`;
    setReportArea(label);
    setTownHits([]);
    setTownLocked(true);
    setTownFocused(false);
  }

  async function pickPlaceHit(hit: {
    id: string;
    name: string;
    area: string;
    gold?: boolean;
    lat?: number;
    lng?: number;
  }) {
    setReportName(hit.name);
    setPlaceHits([]);
    setNameLocked(true);
    setNameFocused(false);
    if (hit.gold && hit.lat != null && hit.lng != null) {
      setReportArea(hit.area);
      setTownLocked(true);
      setPinLat(hit.lat);
      setPinLng(hit.lng);
      setPinStatus("pinned");
      return;
    }
    const gold = realStops.find((s) => s.id === hit.id || isSamePlace(s.name, hit.name));
    if (gold) {
      setReportArea(gold.area);
      setTownLocked(true);
      setPinLat(gold.lat);
      setPinLng(gold.lng);
      setPinStatus("pinned");
      return;
    }
    const res = await fetch(`/api/place?id=${encodeURIComponent(hit.id)}`);
    const data = await res.json();
    if (data.place) {
      setReportName(data.place.name || hit.name);
      setReportArea(data.place.area || hit.area);
      setTownLocked(true);
      setNameLocked(true);
      applyGoogleHours(data.place.hours, data.place.hoursFull);
      if (data.place.lat && data.place.lng) {
        setPinLat(data.place.lat);
        setPinLng(data.place.lng);
        setPinStatus("pinned");
      }
    } else {
      setReportArea(hit.area);
      setTownLocked(true);
    }
  }

  async function pickArea(id: string, name: string, area: string) {
    setAreaSuggestions([]);
    const res = await fetch(`/api/place?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (data.place?.lat) {
      await applyOrigin(data.place.area || `${name}, ${area}`, data.place.lat, data.place.lng);
    } else {
      setLocationDraft(`${name} ${area}`.trim());
      await geocodeDraft();
    }
  }

  function toggleNeed(label: string) {
    setPlaceSearch("");
    if (selectedNeeds.includes(label)) {
      // Turning a need off also clears its sub-chips so they can't silently filter later searches.
      setRefinements((current) => dropSubChipsOf(label, current));
    }
    setSelectedNeeds((current) =>
      current.includes(label) ? current.filter((n) => n !== label) : [...current, label],
    );
  }

  function addRefinement(text: string) {
    const chip = text.trim().replace(/\s+/g, " ");
    if (!chip) return;
    setPlaceSearch("");
    setRefinements((current) =>
      current.some((item) => item.toLowerCase() === chip.toLowerCase())
        ? current
        : [...current, chip],
    );
  }

  function talkToRomi(event?: FormEvent) {
    event?.preventDefault();
    const text = briefDraft.trim();
    if (!text) return;
    const heard = needsFromText(text);
    const found: string[] = heard.needs;
    for (const sub of heard.subChips) addRefinement(sub);
    if (found.length) {
      setSelectedNeeds((current) => [...new Set([...current, ...found])]);
    }
    addRefinement(text);
    const where = origin?.label.split(",")[0] || "this area";
    setRomiReply(
      `Got it — ${found.length ? found.join(" + ") : "that"} around ${where}${
        /golf cart/i.test(text) ? ", leaning golf-cart fun" : ""
      }. Keep talking and I’ll tighten the pins.`,
    );
    setBriefDraft("");
  }

  function applyGoogleHours(hours?: string, hoursFull?: string) {
    const full = (hoursFull || hours || "").trim();
    setGoogleHours(full);
    setHoursOk("");
    setHoursSeen("");
  }

  async function startPlaceReport(prefill?: {
    name?: string;
    area?: string;
    lat?: number;
    lng?: number;
    id?: string;
    hours?: string;
    hoursFull?: string;
  }) {
    setReportName(prefill?.name || "");
    setReportArea(prefill?.area || origin?.label || "");
    setReportNeeds(selectedNeeds);
    setReportNotes("");
    setReturnAgain("");
    setBeenThere("yes");
    setPullThrough("unsure");
    setReportDogs("unsure");
    applyGoogleHours(prefill?.hours, prefill?.hoursFull);
    setJustSaved(null);
    setFormError("");
    setGoogleWrong(false);
    setPlaceHits([]);
    setTownHits([]);
    setNameFocused(false);
    setTownFocused(false);
    setNameLocked(!!prefill?.name);
    setTownLocked(!!prefill?.area);
    if (prefill?.lat != null && prefill?.lng != null) {
      setPinLat(prefill.lat);
      setPinLng(prefill.lng);
      setPinStatus("pinned");
    } else {
      setPinLat(null);
      setPinLng(null);
      setPinStatus("idle");
    }
    setScreen("report");
    const googleId = prefill?.id && prefill.id.startsWith("ChIJ") ? prefill.id : "";
    if (googleId && !(prefill?.hoursFull || prefill?.hours)) {
      void fetch(`/api/place?id=${encodeURIComponent(googleId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.place?.hoursFull || data.place?.hours) {
            applyGoogleHours(data.place.hours, data.place.hoursFull);
          }
        })
        .catch(() => {});
    }
  }

  async function savePlaceReport(event: FormEvent<HTMLFormElement>): Promise<boolean> {
    event.preventDefault();
    if (!reportName.trim() || !reportArea.trim()) {
      setFormError("Need the place name and the town.");
      return false;
    }
    if (beenThere !== "yes") {
      setFormError("Only scout a place you actually went.");
      return false;
    }
    setFormError("");
    let lat = pinLat;
    let lng = pinLng;
    if (lat == null || lng == null) {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(`${reportName.trim()} ${reportArea.trim()}`)}`,
        );
        const data = await res.json();
        if (data.lat && data.lng) {
          lat = data.lat;
          lng = data.lng;
          setPinLat(data.lat);
          setPinLng(data.lng);
          setPinStatus("pinned");
        }
      } catch {
        // keep going — the report still sends
      }
    }
    const notes = reportNotes.trim();
    const points = 10 + (notes.length > 12 ? 10 : 0) + (googleWrong ? 5 : 0);
    const newReport: TravelerReport = {
      id: `${Date.now()}`,
      name: reportName.trim(),
      area: reportArea.trim(),
      helpsWith: reportNeeds,
      beenThere,
      pullThrough,
      dogFriendly: reportDogs,
      hoursSeen: hoursSeen.trim(),
      shade: "",
      wifi: "",
      vibe: "",
      notes,
      returnAgain,
      status: "pending",
      points,
    };
    setTravelerReports((current) => [newReport, ...current]);
    setScoutPoints((n) => n + points);
    setJustSaved({ name: newReport.name, points });
    setReportName("");
    setReportArea("");
    setReportNeeds([]);
    setReportNotes("");
    setReturnAgain("");
    setHoursSeen("");
    setGoogleHours("");
    setHoursOk("");
    setPullThrough("unsure");
    setReportDogs("unsure");
    setBeenThere("yes");
    setGoogleWrong(false);
    setTownHits([]);
    setPlaceHits([]);
    setNameLocked(false);
    setTownLocked(false);
    setPinLat(null);
    setPinLng(null);
    setPinStatus("idle");
    return true;
  }

  function pinHere() {
    if (!navigator.geolocation) {
      setPinStatus("denied");
      return;
    }
    setPinStatus("pinning");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPinLat(pos.coords.latitude);
        setPinLng(pos.coords.longitude);
        setPinStatus("pinned");
      },
      () => setPinStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function saveThisDay() {
    if (!origin) return;
    const name = dayName.trim() || `${origin.label.split(",")[0]} day`;
    const placeIds = verifiedHere().map((s) => s.id);
    setSavedDays((current) => [
      {
        id: `${Date.now()}`,
        name,
        location: origin.label,
        needs: selectedNeeds,
        placeIds,
      },
      ...current.filter((d) => d.name !== name),
    ]);
  }

  function openDay(day: SavedDay) {
    setViewingSavedDay(day);
    setSelectedNeeds(day.needs);
    setDayName(day.name);
    setScreen("home");
    setHomeView("results");
    const match = realStops.find((s) => day.placeIds.includes(s.id));
    if (match) applyOrigin(day.location, match.lat, match.lng);
  }


  function reviewsFor(placeId: string, placeName: string) {
    const list = placeReviews.filter(
      (r) => r.placeId === placeId || isSamePlace(r.placeName, placeName),
    );
    return [...list].sort((a, b) => (reviewSort === "recent" ? b.at - a.at : a.at - b.at));
  }

  function asksFor(placeId: string) {
    return reverifyAsks.filter((a) => a.placeId === placeId);
  }

  function latestAsk(placeId: string) {
    return asksFor(placeId)[0] || null;
  }

  function travelerScore(placeId: string, placeName: string) {
    const list = reviewsFor(placeId, placeName);
    if (!list.length) return null;
    const avg = list.reduce((sum, r) => sum + r.stars, 0) / list.length;
    return { avg: Math.round(avg * 10) / 10, count: list.length };
  }

  function addReview(placeId: string, placeName: string) {
    if (reviewStars < 1) return;
    const next: PlaceReview = {
      id: `${Date.now()}`,
      placeId,
      placeName,
      stars: reviewStars,
      text: reviewText.trim(),
      at: Date.now(),
    };
    setPlaceReviews((cur) => [next, ...cur]);
    setReviewStars(0);
    setReviewText("");
    setReviewThanks("Thank you.");
    window.setTimeout(() => setReviewThanks(""), 4000);
  }

  function askReverify(placeId: string, placeName: string) {
    const reason = reverifyReason.trim();
    if (!reason) return;
    setReverifyAsks((cur) => [
      {
        id: `${Date.now()}`,
        placeId,
        placeName,
        reason,
        status: "for-angela",
        at: Date.now(),
      },
      ...cur,
    ]);
    setReverifyReason("");
    setReverifyOpen(false);
  }

  return {
    screen,
    setScreen,
    selectedNeeds,
    setSelectedNeeds,
    origin,
    setOrigin,
    locationDraft,
    setLocationDraft,
    placeSearch,
    setPlaceSearch,
    briefDraft,
    setBriefDraft,
    refinements,
    setRefinements,
    romiReply,
    setRomiReply,
    suggestions,
    setSuggestions,
    areaSuggestions,
    setAreaSuggestions,
    nearbyPlaces,
    setNearbyPlaces,
    searchPlaces,
    setSearchPlaces,
    highlightedId,
    setHighlightedId,
    expandedId,
    setExpandedId,
    nearbyStatus,
    searchStatus,
    resultsArea,
    appliedArea,
    isSearching,
    setNearbyStatus,
    geoStatus,
    setGeoStatus,
    travelerReports,
    setTravelerReports,
    hasLoadedReports,
    setHasLoadedReports,
    savedPlaceIds,
    setSavedPlaceIds,
    savedDays,
    setSavedDays,
    flaggedPlaces,
    setFlaggedPlaces,
    scoutPoints,
    setScoutPoints,
    viewingSavedDay,
    setViewingSavedDay,
    dayName,
    setDayName,
    reportName,
    setReportName,
    reportArea,
    setReportArea,
    reportNeeds,
    setReportNeeds,
    reportNotes,
    setReportNotes,
    returnAgain,
    setReturnAgain,
    beenThere,
    setBeenThere,
    pullThrough,
    setPullThrough,
    reportDogs,
    setReportDogs,
    hoursSeen,
    setHoursSeen,
    googleHours,
    setGoogleHours,
    hoursOk,
    setHoursOk,
    justSaved,
    setJustSaved,
    formError,
    setFormError,
    placeReviews,
    setPlaceReviews,
    reviewStars,
    setReviewStars,
    reviewText,
    setReviewText,
    reviewThanks,
    setReviewThanks,
    reviewSort,
    setReviewSort,
    reverifyAsks,
    setReverifyAsks,
    reverifyReason,
    setReverifyReason,
    reverifyOpen,
    setReverifyOpen,
    googleWrong,
    setGoogleWrong,
    pinStatus,
    setPinStatus,
    pinLat,
    setPinLat,
    pinLng,
    setPinLng,
    townHits,
    setTownHits,
    placeHits,
    setPlaceHits,
    nameFocused,
    setNameFocused,
    townFocused,
    setTownFocused,
    nameLocked,
    setNameLocked,
    townLocked,
    setTownLocked,
    radiusMiles,
    setRadiusMiles,
    matchingNeeds,
    inRadius,
    verifiedHere,
    googleLeads,
    allCards,
    mapStops,
    selectedCard,
    applyOrigin,
    geocodeDraft,
    useMyLocation,
    pickSuggestion,
    pickTownHit,
    pickPlaceHit,
    pickArea,
    toggleNeed,
    addRefinement,
    talkToRomi,
    applyGoogleHours,
    startPlaceReport,
    savePlaceReport,
    pinHere,
    saveThisDay,
    openDay,
    reviewsFor,
    asksFor,
    latestAsk,
    travelerScore,
    addReview,
    askReverify,
    radiusMeters,
    milesFromOrigin,
    pickedSubs,
    homeView,
    setHomeView,
  };
}

export type Romi = ReturnType<typeof useRomiState>;

import { NEED_BY_LABEL } from "@/lib/needs";

/** Remove the sub-chip refinements that belong to `need` (e.g. "Vet" when "Dog Needs" is turned off). Free-text refinements stay. */
export function dropSubChipsOf(need: string, refinements: string[]): string[] {
  const subs = new Set((NEED_BY_LABEL[need]?.subChips || []).map((s) => s.label.toLowerCase()));
  if (subs.size === 0) return refinements;
  return refinements.filter((r) => !subs.has(r.toLowerCase()));
}

/** Request-id guard: only the most recently started request may apply its results. */
export function createLatestGuard() {
  let current = 0;
  return {
    start() {
      current += 1;
      return current;
    },
    isLatest(id: number) {
      return id === current;
    },
  };
}

export type SearchArea = { label: string; lat: number; lng: number; radiusMiles: number };

/** Caption for the results list, taken from the search that produced them. */
export function resultsCaption(area: SearchArea | null, count: number, loading: boolean) {
  if (!area) return loading ? "Looking around…" : "";
  const where = area.label.split(",")[0];
  if (loading) return `Looking within ${area.radiusMiles} mi of ${where}…`;
  return `${count} within ${area.radiusMiles} mi of ${where}`;
}

/** Split already-filtered results by source, preserving the incoming order within each group. Display only. */
export function groupByStatus<T extends { status?: "verified" | "google" }>(cards: T[]) {
  const verified: T[] = [];
  const google: T[] = [];
  for (const c of cards) ((c.status || "verified") === "google" ? google : verified).push(c);
  return { verified, google };
}

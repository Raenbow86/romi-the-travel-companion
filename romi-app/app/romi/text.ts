/** Cut text to at most `max` chars on a word boundary, adding "…" when anything was removed. */
export function clipWords(text: string, max: number): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  let cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  if (space > max * 0.5) cut = cut.slice(0, space);
  return `${cut.replace(/[\s,;:.!?-]+$/, "")}…`;
}

function norm(s: string) {
  return s.toLowerCase().replace(/…$/, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** True when `about` is just (a cut of) the review text, so showing both would duplicate it. */
export function duplicatesReview(about?: string, review?: string): boolean {
  if (!about || !review) return false;
  const a = norm(about);
  const r = norm(review);
  if (!a || !r) return false;
  return r.includes(a) || a.includes(r);
}

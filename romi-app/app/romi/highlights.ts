import { clipWords } from "./text";

/**
 * Curated, deterministic highlight phrases. Each entry: chip label + patterns (synonyms; plurals handled by `s?`).
 * Shared by Google leads (from reviews) and scout-verified places (from scout notes), so both show the same chips.
 */
const PHRASES: Array<{ label: string; icon: string; patterns: RegExp[] }> = [
  { label: "Pool tables", icon: "🎱", patterns: [/\bpool tables?\b/, /\bbilliards?\b/] },
  { label: "Golf simulator", icon: "⛳", patterns: [/\bgolf sim(ulator)?s?\b/] },
  { label: "Live music", icon: "🎵", patterns: [/\blive (music|bands?)\b/, /\bconcerts?\b/] },
  { label: "Patio", icon: "🌤️", patterns: [/\bpatios?\b/, /\boutdoor seating\b/, /\bcourtyard\b/, /\bbeer garden\b/] },
  { label: "Relaxed vibe", icon: "🍺", patterns: [/\brelaxed\b/, /\blaid[- ]back\b/, /\bchill\b/] },
  { label: "Good energy", icon: "✨", patterns: [/\bgood (energy|vibes?)\b/, /\bgreat (energy|vibes?|atmosphere)\b/, /\bfun spots?\b/] },
  { label: "Friendly staff", icon: "🙂", patterns: [/\bfriendly (staff|service|people|bartenders?|owners?)\b/, /\b(staff|service) (was|were|is|are) (so |very |super )?friendly\b/] },
  { label: "Clean restrooms", icon: "🚻", patterns: [/\bclean (rest ?rooms?|bathrooms?|toilets?)\b/, /\b(rest ?rooms?|bathrooms?) (were|was|are|is) (very |super )?clean\b/] },
  { label: "Big rig friendly", icon: "🚛", patterns: [/\bbig rigs?\b/, /\bpull[- ]?throughs?\b/, /\brv parking\b/, /\btrucks? parking\b/] },
  { label: "Dog-friendly", icon: "🐕", patterns: [/\bdogs? (are |were )?(welcome|friendly|ok|allowed)\b/, /\bdog[- ]friendly\b/, /\bpets? (welcome|allowed|on leash)\b/, /\bdogs on (a )?leash\b/] },
  { label: "Wi‑Fi", icon: "📶", patterns: [/\bwi-?fi\b/, /\bwireless internet\b/] },
  { label: "Quiet", icon: "🤫", patterns: [/\bquiet\b/, /\bpeaceful\b/] },
  { label: "Cheap gas", icon: "⛽", patterns: [/\b(cheap|cheapest|good|low) (gas|fuel|diesel)( prices?)?\b/] },
  { label: "Good coffee", icon: "☕", patterns: [/\b(good|great|best|amazing) (coffee|espresso|lattes?)\b/] },
  { label: "Great burgers", icon: "🍔", patterns: [/\bburgers?\b/] },
  { label: "Fresh bread", icon: "🍞", patterns: [/\bbread\b/, /\bbakery\b/, /\bpastr(y|ies)\b/] },
  { label: "Wine tasting", icon: "🍷", patterns: [/\btasting rooms?\b/, /\bwine tastings?\b/, /\bwiner(y|ies)\b/] },
  { label: "Great views", icon: "🏞️", patterns: [/\b(great|amazing|wow|beautiful|stunning) views?\b/, /\bscenic\b/] },
  { label: "U-pick", icon: "🍑", patterns: [/\bu-?pick\b/] },
  { label: "Breakfast", icon: "🍳", patterns: [/\bbreakfast\b/, /\bbrunch\b/] },
  { label: "Open late", icon: "🌙", patterns: [/\bopen late\b/, /\blate night\b/] },
  { label: "Open 24h", icon: "🕒", patterns: [/\b24 ?(hours|hrs|h|\/7)\b/, /\bopen all night\b/] },
  { label: "River access", icon: "🏞️", patterns: [/\briver (picnic|access)\b/, /\bon the [a-z]+ river\b/] },
];

const ICON: Record<string, string> = Object.fromEntries(PHRASES.map((p) => [p.label, p.icon]));
export function highlightIcon(label: string) {
  return ICON[label] || "•";
}

/** Rank curated phrases by how many texts mention them (then total mentions, then list order). */
export function extractHighlights(texts: string[], max = 5): string[] {
  const docs = texts.map((t) => (t || "").toLowerCase().replace(/[’‘]/g, "'"));
  const scored = PHRASES.map((p, order) => {
    let docsHit = 0;
    let hits = 0;
    for (const d of docs) {
      let n = 0;
      for (const re of p.patterns) n += (d.match(new RegExp(re.source, "g")) || []).length;
      if (n) docsHit += 1;
      hits += n;
    }
    return { label: p.label, docsHit, hits, order };
  }).filter((s) => s.hits > 0);
  scored.sort((a, b) => b.docsHit - a.docsHit || b.hits - a.hits || a.order - b.order);
  return scored.slice(0, max).map((s) => s.label);
}

export type ReviewLike = { text?: string; rating?: number };

/** One representative quote: highest-rated review with real text (ties → first), first sentence(s), ~120 chars. */
export function pickQuote(reviews: ReviewLike[], max = 120): { quote: string; full: string } | null {
  const usable = reviews
    .map((r, i) => ({ text: (r.text || "").replace(/\s+/g, " ").trim(), rating: r.rating ?? 0, i }))
    .filter((r) => r.text.length >= 20);
  if (!usable.length) return null;
  usable.sort((a, b) => b.rating - a.rating || a.i - b.i);
  const best = usable[0];
  const lead = best.text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  return { quote: clipWords(lead, max), full: best.text };
}

/** Highlights for a scout-verified place from the scout's own words plus scout toggles, if any. */
export function scoutHighlights(
  stop: { description?: string; note?: string },
  toggles?: { pullThrough?: string; dogFriendly?: string },
  max = 5,
): string[] {
  const out: string[] = [];
  if (toggles?.pullThrough === "yes") out.push("Big rig friendly");
  if (toggles?.dogFriendly === "yes" || toggles?.dogFriendly === "leash") out.push("Dog-friendly");
  for (const h of extractHighlights([stop.description || "", stop.note || ""], max + 2)) {
    if (!out.includes(h)) out.push(h);
  }
  return out.slice(0, max);
}

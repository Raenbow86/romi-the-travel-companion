import { test } from "node:test";
import assert from "node:assert/strict";
import { extractHighlights, pickQuote, scoutHighlights } from "./highlights";
import { realStops } from "./data";

const sageGrouse = [
  { rating: 5, text: "The Sage Grouse Lounge is one of the most fun spots in Gunnison. It's a relaxed bar with pool tables, good energy, and a surprisingly great golf simulator." },
  { rating: 4, text: "Shot pool for hours, the pool table was in great shape. Friendly bartenders." },
  { rating: 3, text: "Golf sim was booked. Relaxed atmosphere though, and the staff were friendly." },
  { rating: 4, text: "Nice patio." },
];

test("extracts curated phrases with synonyms/plurals, ranked by how many reviews mention them", () => {
  const h = extractHighlights(sageGrouse.map((r) => r.text));
  assert.deepEqual(h.slice(0, 4), ["Pool tables", "Golf simulator", "Relaxed vibe", "Friendly staff"]);
  assert.ok(h.length <= 5);
});

test("caps the number of highlights", () => {
  assert.equal(extractHighlights(sageGrouse.map((r) => r.text), 3).length, 3);
});

test("no matches → empty list", () => {
  assert.deepEqual(extractHighlights(["It was fine.", ""]), []);
});

test("is deterministic", () => {
  const t = sageGrouse.map((r) => r.text);
  assert.deepEqual(extractHighlights(t), extractHighlights([...t]));
});

test("quote picks the highest-rated review and clips on a word boundary", () => {
  const q = pickQuote(sageGrouse)!;
  assert.ok(q.full.startsWith("The Sage Grouse Lounge"));
  assert.ok(q.quote.length <= 120);
  assert.ok(!/\w…$/.test(q.quote) || q.full.includes(q.quote.slice(0, -1)));
  assert.equal(pickQuote([{ text: "ok" }]), null);
});

test("scout highlights come from scout notes and toggles", () => {
  const powerstop = realStops.find((s) => s.id === "the-powerstop")!;
  assert.ok(scoutHighlights(powerstop).includes("Great burgers"));
  const h = scoutHighlights({ note: "quiet" }, { pullThrough: "yes", dogFriendly: "leash" });
  assert.deepEqual(h, ["Big rig friendly", "Dog-friendly", "Quiet"]);
});

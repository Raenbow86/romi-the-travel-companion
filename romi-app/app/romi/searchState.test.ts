import { test } from "node:test";
import assert from "node:assert/strict";
import { NEED_BY_LABEL } from "../../lib/needs";
import { createLatestGuard, dropSubChipsOf, resultsCaption } from "./searchState";

const needWithSubs = Object.values(NEED_BY_LABEL).find((n) => n.subChips.length > 0)!;
const otherWithSubs = Object.values(NEED_BY_LABEL).find((n) => n.subChips.length > 0 && n.label !== needWithSubs.label)!;

test("deselecting a need drops only its sub-chips", () => {
  const mine = needWithSubs.subChips[0].label;
  const theirs = otherWithSubs.subChips[0].label;
  const out = dropSubChipsOf(needWithSubs.label, [mine.toUpperCase(), theirs, "big rig parking"]);
  assert.deepEqual(out, [theirs, "big rig parking"]);
});

test("need without sub-chips leaves refinements alone", () => {
  assert.deepEqual(dropSubChipsOf("not-a-need", ["x"]), ["x"]);
});

test("Dog Needs drops Vet when present", () => {
  const dog = NEED_BY_LABEL["Dog Needs"];
  if (!dog || !dog.subChips.some((s) => s.label === "Vet")) return;
  assert.deepEqual(dropSubChipsOf("Dog Needs", ["Vet"]), []);
});

test("only the latest request is applied", () => {
  const g = createLatestGuard();
  const a = g.start();
  const b = g.start();
  assert.equal(g.isLatest(a), false);
  assert.equal(g.isLatest(b), true);
});

test("caption comes from the search area, not live input", () => {
  const area = { label: "Paonia, Colorado", lat: 1, lng: 2, radiusMiles: 15 };
  assert.equal(resultsCaption(area, 3, false), "3 within 15 mi of Paonia");
  assert.equal(resultsCaption(area, 0, true), "Looking within 15 mi of Paonia…");
  assert.equal(resultsCaption(null, 0, true), "Looking around…");
});

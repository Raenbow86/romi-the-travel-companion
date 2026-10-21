import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByStatus } from "./grouping";

test("splits by status and keeps order within each group", () => {
  const cards = [
    { id: "g1", status: "google" as const },
    { id: "v1", status: "verified" as const },
    { id: "g2", status: "google" as const },
    { id: "v2" },
  ];
  const { verified, google } = groupByStatus(cards);
  assert.deepEqual(verified.map((c) => c.id), ["v1", "v2"]);
  assert.deepEqual(google.map((c) => c.id), ["g1", "g2"]);
});

test("nothing is dropped or duplicated", () => {
  const cards = Array.from({ length: 7 }, (_, i) => ({ id: String(i), status: i % 3 ? ("google" as const) : ("verified" as const) }));
  const { verified, google } = groupByStatus(cards);
  assert.equal(verified.length + google.length, cards.length);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { clipWords, duplicatesReview } from "./text";

const review =
  "Great coffee and friendly staff. We loved the knowledgeable barista who walked us through every single option on the menu.";

test("clipWords keeps short text unchanged", () => {
  assert.equal(clipWords("Short and sweet.", 50), "Short and sweet.");
});

test("clipWords cuts on a word boundary with an ellipsis", () => {
  const out = clipWords(review, 60);
  assert.ok(out.endsWith("…"));
  assert.ok(out.length <= 60);
  assert.ok(!/knowledgeab…/.test(out));
  assert.ok(review.startsWith(out.slice(0, -1)));
});

test("an ABOUT that is a cut of the review counts as a duplicate", () => {
  assert.equal(duplicatesReview(review.slice(0, 70), review), true); // mid-word cut, as the API used to do
  assert.equal(duplicatesReview(clipWords(review, 60), review), true);
});

test("a real editorial summary is not a duplicate", () => {
  assert.equal(duplicatesReview("Cozy cafe serving espresso drinks and pastries.", review), false);
  assert.equal(duplicatesReview("Anything", undefined), false);
});

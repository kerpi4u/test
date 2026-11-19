import assert from "node:assert/strict";
import { test } from "node:test";

import { fuzzyMatch, normalize, rank } from "../src/js/lib/fuzzy.js";

test("normalizes case and diacritics", () => {
  assert.equal(normalize("Русский"), "русский");
  assert.equal(normalize("Crème Brûlée"), "creme brulee");
});

test("matches subsequences and returns their indices", () => {
  const result = fuzzyMatch("plgr", "Playground");
  assert.ok(result, "expected a match");
  assert.deepEqual(result.indices, [0, 1, 4, 5]);
});

test("rejects characters in the wrong order", () => {
  assert.equal(fuzzyMatch("zzz", "playground"), null);
  assert.equal(fuzzyMatch("gym", "playground"), null);
});

test("prefers consecutive and word-start matches", () => {
  const consecutive = fuzzyMatch("play", "playground");
  const scattered = fuzzyMatch("play", "p-l-a-y-ground");

  assert.ok(consecutive.score > scattered.score);
});

test("empty query matches everything with score 0", () => {
  assert.deepEqual(fuzzyMatch("", "anything"), { score: 0, indices: [] });
});

test("rank orders the most relevant item first", () => {
  const items = ["Toggle theme", "Random theme", "Open playground", "Back to top"];
  const ranked = rank("theme", items, (item) => item);

  assert.equal(ranked[0].item, "Toggle theme");
  assert.ok(ranked.every(({ item }) => item.toLowerCase().includes("theme")));
});

test("rank drops non-matching items", () => {
  const ranked = rank("xyz", ["alpha", "beta"], (item) => item);
  assert.equal(ranked.length, 0);
});

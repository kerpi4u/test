import assert from "node:assert/strict";
import { test } from "node:test";

import { SNIPPETS, GREETINGS } from "../src/js/data/snippets.js";

test("ships exactly 20 snippets", () => {
  assert.equal(SNIPPETS.length, 20);
});

test("ids are unique and URL-safe", () => {
  const ids = SNIPPETS.map((snippet) => snippet.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate snippet id");

  for (const id of ids) {
    assert.match(id, /^[a-z][a-z0-9]*$/);
  }
});

test("every snippet has the fields the UI needs", () => {
  for (const snippet of SNIPPETS) {
    assert.ok(snippet.name, `missing name for ${snippet.id}`);
    assert.ok(snippet.file && /\.[a-z]+$/i.test(snippet.file), `bad file name for ${snippet.id}`);
    assert.ok(Array.isArray(snippet.keywords) && snippet.keywords.length > 0, `missing keywords for ${snippet.id}`);
    assert.ok(snippet.code.trim().length > 20, `snippet ${snippet.id} looks empty`);
    assert.match(snippet.code, /hello/i, `snippet ${snippet.id} should greet the world`);
  }
});

test("keywords are unique and lowercase-ish within a snippet", () => {
  for (const snippet of SNIPPETS) {
    const lower = snippet.keywords.map((keyword) => keyword.toLowerCase());
    assert.equal(new Set(lower).size, lower.length, `duplicate keywords in ${snippet.id}`);
  }
});

test("greetings for the typewriter are short one-liners", () => {
  assert.ok(GREETINGS.length >= 5);
  for (const greeting of GREETINGS) {
    assert.ok(greeting.length > 8 && greeting.length < 60, `suspicious greeting: ${greeting}`);
    assert.ok(!greeting.includes("\n"));
  }
});

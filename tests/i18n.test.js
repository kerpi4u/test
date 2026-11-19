import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { DICTIONARIES } from "../src/js/data/i18n.js";
import { translate } from "../src/js/lib/translate.js";

const locales = Object.keys(DICTIONARIES);
const baseKeys = Object.keys(DICTIONARIES.ru).sort();

test("both locales expose exactly the same keys", () => {
  for (const locale of locales) {
    assert.deepEqual(Object.keys(DICTIONARIES[locale]).sort(), baseKeys, `locale: ${locale}`);
  }
});

test("every key resolves to a non-empty string in every locale", () => {
  for (const locale of locales) {
    for (const key of baseKeys) {
      const value = DICTIONARIES[locale][key];
      assert.equal(typeof value, "string", `${locale}.${key} must be a string`);
      assert.ok(value.trim().length > 0, `${locale}.${key} must not be empty`);
    }
  }
});

test("translate interpolates placeholders", () => {
  assert.equal(translate(DICTIONARIES, "ru", "cmd.snippet", { lang: "Rust" }), "Hello World на Rust");
  assert.equal(translate(DICTIONARIES, "en", "cmd.snippet", { lang: "Rust" }), "Hello World in Rust");
});

test("unknown placeholders are preserved", () => {
  assert.equal(translate({ ru: { greeting: "Привет, {name}!" } }, "ru", "greeting"), "Привет, {name}!");
});

test("missing keys fall back to English, then to the key itself", () => {
  const dictionaries = {
    ru: { onlyRu: "только русский" },
    en: { onlyEn: "english only" },
  };

  assert.equal(translate(dictionaries, "ru", "onlyEn"), "english only");
  assert.equal(translate(dictionaries, "ru", "nope"), "nope");
});

test("index.html only references known translation keys", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const keys = [...html.matchAll(/data-i18n(?:-placeholder|-aria)?="([^"]+)"/g)].map((match) => match[1]);

  assert.ok(keys.length > 50, "expected a decent number of bound keys");
  for (const key of keys) {
    assert.ok(key in DICTIONARIES.ru, `missing ru key: ${key}`);
    assert.ok(key in DICTIONARIES.en, `missing en key: ${key}`);
  }
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { PALETTE_DEFAULTS, buildPaletteCss, randomPalette } from "../src/js/theme.js";

const HEX = /^#[0-9a-f]{6}$/i;

test("default palette is made of valid tokens", () => {
  assert.match(PALETTE_DEFAULTS.accent, HEX);
  assert.match(PALETTE_DEFAULTS.accent2, HEX);
  assert.match(PALETTE_DEFAULTS.bg, HEX);
  assert.match(PALETTE_DEFAULTS.text, HEX);
  assert.ok(PALETTE_DEFAULTS.radius >= 0 && PALETTE_DEFAULTS.radius <= 36);
  assert.ok(PALETTE_DEFAULTS.glow >= 0 && PALETTE_DEFAULTS.glow <= 100);
});

test("buildPaletteCss emits ready-to-paste custom properties", () => {
  const css = buildPaletteCss({ ...PALETTE_DEFAULTS, radius: 12, glow: 40 });

  assert.match(css, /^:root \{/);
  assert.match(css, /--accent: #22d3ee;/);
  assert.match(css, /--radius: 12px;/);
  assert.match(css, /--glow-strength: 0\.40;/);
  assert.ok(css.trim().endsWith("}"));
});

test("randomPalette always produces a usable palette", () => {
  for (let i = 0; i < 200; i++) {
    const palette = randomPalette();
    assert.match(palette.accent, HEX);
    assert.match(palette.accent2, HEX);
    assert.match(palette.bg, HEX);
    assert.match(palette.text, HEX);
    assert.ok(Number.isInteger(palette.radius) && palette.radius >= 8 && palette.radius <= 28);
    assert.ok(Number.isInteger(palette.glow) && palette.glow >= 30 && palette.glow <= 85);
    assert.notEqual(palette.accent, palette.bg);
  }
});

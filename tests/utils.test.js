import assert from "node:assert/strict";
import { test } from "node:test";

import {
  clamp,
  escapeHtml,
  formatNumber,
  hexToRgb,
  luminance,
  readableOn,
} from "../src/js/lib/utils.js";

test("escapeHtml neutralises every dangerous character", () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
  assert.equal(escapeHtml(42), "42");
});

test("clamp keeps numbers in range", () => {
  assert.equal(clamp(120, 0, 100), 100);
  assert.equal(clamp(-5, 0, 100), 0);
  assert.equal(clamp("42", 0, 100), 42);
  assert.equal(clamp(Number.NaN, 0, 100), 0);
});

test("hexToRgb understands long and short notation", () => {
  assert.deepEqual(hexToRgb("#22d3ee"), { r: 34, g: 211, b: 238 });
  assert.deepEqual(hexToRgb("#fff"), { r: 255, g: 255, b: 255 });
  assert.equal(hexToRgb("not-a-colour"), null);
});

test("luminance and readableOn pick a contrasting text colour", () => {
  assert.ok(luminance("#ffffff") > 0.9);
  assert.ok(luminance("#000000") < 0.01);
  assert.equal(readableOn("#0b1020"), "#ffffff");
  assert.equal(readableOn("#ffffff"), "#06121a");
});

test("formatNumber rounds and uses locale separators", () => {
  assert.equal(formatNumber(1234.6).replace(/\D/g, ""), "1235");
});

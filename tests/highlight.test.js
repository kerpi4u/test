import assert from "node:assert/strict";
import { test } from "node:test";

import { highlight } from "../src/js/lib/highlight.js";

const keywords = ["const", "function", "return"];

test("escapes HTML so user code cannot inject markup", () => {
  const html = highlight('const evil = "<img src=x onerror=alert(1)>";', { keywords });

  assert.ok(!html.includes("<img"), "raw tag leaked into the output");
  assert.ok(html.includes("&lt;img"));
});

test("wraps keywords, strings and numbers in token spans", () => {
  const html = highlight('const answer = 42; // "const" in a comment', { keywords });

  assert.match(html, /<span class="tok-key">const<\/span>/);
  assert.match(html, /<span class="tok-num">42<\/span>/);
  assert.match(html, /<span class="tok-com">\/\/ &quot;const&quot; in a comment<\/span>/);
});

test("does not highlight keywords inside strings", () => {
  const html = highlight('return "return const function";', { keywords });
  const stringToken = html.match(/<span class="tok-str">(.*?)<\/span>/s);

  assert.ok(stringToken, "expected a string token");
  assert.ok(!stringToken[1].includes("tok-key"), "string content was tokenised");
});

test("supports hash comments for Python but not for C includes", () => {
  const python = highlight("# hello.py\nprint(1)", { keywords: ["print"], lang: "python" });
  assert.match(python, /<span class="tok-com"># hello\.py<\/span>/);

  const c = highlight("#include <stdio.h>", { keywords: ["int"], lang: "c" });
  assert.ok(!c.includes("tok-com"), "#include must not be treated as a comment");
});

test("highlights SQL dashes comments", () => {
  const sql = highlight("-- greeting\nSELECT 'hi';", { keywords: ["select"], lang: "sql" });
  assert.match(sql, /tok-com/);
  assert.match(sql, /tok-key/);
});

test("returns the untouched text when there are no tokens", () => {
  assert.equal(highlight("plain text", { keywords: [] }), "plain text");
});

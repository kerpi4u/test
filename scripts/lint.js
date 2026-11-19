#!/usr/bin/env node
/**
 * Repository lint: syntax, JSON validity, dead local links, i18n coverage,
 * service-worker precache drift. No external tooling required.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { DICTIONARIES } from "../src/js/data/i18n.js";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const errors = [];
const checks = [];

function walk(dir, visit) {
  for (const entry of readdirSync(dir)) {
    if (entry === ".git" || entry === "node_modules") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function collect(extension) {
  const files = [];
  walk(ROOT, (file) => {
    if (extname(file) === extension) files.push(file);
  });
  return files;
}

/* ------------------------------- 1. syntax ------------------------------- */
const jsFiles = collect(".js").filter((file) => !file.includes(`${ROOT}/tests/`));
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    errors.push(`JS syntax error in ${file.replace(ROOT, ".")}:\n${result.stderr.trim()}`);
  }
}
checks.push(`syntax: ${jsFiles.length} JS files`);

/* -------------------------------- 2. JSON -------------------------------- */
for (const file of ["package.json", "manifest.webmanifest"]) {
  try {
    JSON.parse(readFileSync(join(ROOT, file), "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${file}: ${error.message}`);
  }
}
checks.push("json: package.json, manifest.webmanifest");

/* ---------------------------- 3. local links ----------------------------- */
const htmlFiles = collect(".html");
const refPattern = /(?:href|src)="([^"]+)"/g;
let referenceCount = 0;

for (const file of htmlFiles) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(refPattern)) {
    const ref = match[1];
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(ref)) continue;

    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;

    const target = resolve(join(file, ".."), clean);
    referenceCount += 1;
    if (!existsSync(target)) {
      errors.push(`Broken local reference in ${file.replace(ROOT, ".")} → ${ref}`);
    }
  }
}
checks.push(`links: ${referenceCount} local references in ${htmlFiles.length} HTML files`);

/* -------------------------------- 4. i18n -------------------------------- */
const locales = Object.keys(DICTIONARIES);
const [baseLocale] = locales;
const baseKeys = Object.keys(DICTIONARIES[baseLocale]);

for (const locale of locales.slice(1)) {
  const keys = new Set(Object.keys(DICTIONARIES[locale]));
  const missing = baseKeys.filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !baseKeys.includes(key));
  if (missing.length) errors.push(`i18n: "${locale}" is missing keys: ${missing.join(", ")}`);
  if (extra.length) errors.push(`i18n: "${locale}" has unknown keys: ${extra.join(", ")}`);
}

const unknownKeys = new Set();
for (const file of htmlFiles) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/data-i18n(?:-placeholder|-aria)?="([^"]+)"/g)) {
    if (!baseKeys.includes(match[1])) unknownKeys.add(match[1]);
  }
}
for (const key of unknownKeys) {
  errors.push(`i18n: HTML uses an unknown key "${key}"`);
}
checks.push(`i18n: ${baseKeys.length} keys × ${locales.length} locales`);

/* -------------------------- 4b. DOM id lookups --------------------------- */
const indexHtml = readFileSync(join(ROOT, "index.html"), "utf8");
const htmlIds = new Set([...indexHtml.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
let idLookups = 0;

for (const file of jsFiles) {
  if (file.includes(`${ROOT}/scripts/`)) continue;
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/getElementById\("([^"]+)"\)/g)) {
    idLookups += 1;
    if (!htmlIds.has(match[1])) {
      errors.push(`DOM: getElementById("${match[1]}") in ${file.replace(ROOT, ".")} has no matching id in index.html`);
    }
  }
}
checks.push(`dom: ${idLookups} id lookups resolved`);

/* --------------------------- 5. service worker --------------------------- */
const swSource = readFileSync(join(ROOT, "sw.js"), "utf8");
const coreMatch = swSource.match(/const CORE = \[([\s\S]*?)\];/);
if (!coreMatch) {
  errors.push("sw.js: could not find the CORE precache list");
} else {
  const core = [...coreMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  for (const path of core) {
    const target = resolve(ROOT, path.replace(/^\.\//, ""));
    const isDirectory = path === "./";
    if (!isDirectory && !existsSync(target)) {
      errors.push(`sw.js: precached file does not exist → ${path}`);
    }
  }
  checks.push(`sw: ${core.length} precached entries`);
}

/* -------------------------------- report --------------------------------- */
for (const check of checks) console.log(`  ✓ ${check}`);

if (errors.length) {
  console.error(`\n${errors.length} problem(s) found:\n`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

console.log("\nLint passed.");

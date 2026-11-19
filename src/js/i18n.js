/** Minimal i18n runtime: dictionaries, interpolation, DOM binding. */
import { DICTIONARIES } from "./data/i18n.js";
import { translate } from "./lib/translate.js";
import { storage } from "./lib/utils.js";

const LANG_KEY = "hw:lang";
const SUPPORTED = Object.keys(DICTIONARIES);
const listeners = new Set();

function resolveInitialLang() {
  const stored = storage.get(LANG_KEY);
  if (SUPPORTED.includes(stored)) return stored;

  const browser = (navigator.language || "ru").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : "ru";
}

let current = resolveInitialLang();

/** Get the active locale. */
export function getLang() {
  return current;
}

/** The other locale, used by the toggle button. */
export function otherLang() {
  return current === "ru" ? "en" : "ru";
}

/**
 * Translate a key and interpolate `{placeholders}`.
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 */
export function t(key, vars = {}) {
  return translate(DICTIONARIES, current, key, vars);
}

/** Apply translations to every bound element inside `root`. */
export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  document.documentElement.lang = current;
  document.title = t("meta.title");

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("meta.description"));

  const langLabel = document.getElementById("lang-label");
  if (langLabel) langLabel.textContent = current === "ru" ? "EN" : "RU";
}

/** Switch locale, persist it and notify subscribers. */
export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === current) return current;
  current = lang;
  storage.set(LANG_KEY, lang);
  applyTranslations();
  listeners.forEach((callback) => callback(lang));
  return current;
}

/** Subscribe to locale changes. Returns an unsubscribe function. */
export function onLangChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

if (typeof document !== "undefined") applyTranslations();

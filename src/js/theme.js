/** Colour scheme handling: system preference, persistence, CSS variables. */
import { storage } from "./lib/utils.js";

const THEME_KEY = "hw:theme";
const THEMES = ["dark", "light"];

export const PALETTE_DEFAULTS = {
  accent: "#22d3ee",
  accent2: "#a78bfa",
  bg: "#0b1020",
  text: "#e9edf7",
  radius: 18,
  glow: 50,
};

export function resolveInitialTheme() {
  const stored = storage.get(THEME_KEY);
  if (THEMES.includes(stored)) return stored;

  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function applyTheme(theme) {
  const next = THEMES.includes(theme) ? theme : "dark";
  document.documentElement.dataset.theme = next;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", next === "light" ? "#f6f7fc" : "#05070f");

  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(next === "light"));
    toggle.setAttribute("title", next === "light" ? "Тёмная тема" : "Светлая тема");
  }

  return next;
}

export function setTheme(theme) {
  const commit = () => {
    const next = applyTheme(theme);
    storage.set(THEME_KEY, next);
    document.dispatchEvent(new CustomEvent("theme:change", { detail: { theme: next } }));
    return next;
  };

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition === "function" && !reduceMotion) {
    document.startViewTransition(commit);
    return applyTheme(theme);
  }

  return commit();
}

export function toggleTheme() {
  return setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
}

/** Follow the OS only while the user has not made an explicit choice. */
export function watchSystemTheme() {
  if (!window.matchMedia) return;
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const handler = (event) => {
    if (storage.get(THEME_KEY)) return;
    applyTheme(event.matches ? "light" : "dark");
  };
  if (media.addEventListener) media.addEventListener("change", handler);
  else if (media.addListener) media.addListener(handler);
}

/* --------------------------- palette helpers --------------------------- */

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/** Build a harmonious random palette using analogous hue offsets. */
export function randomPalette() {
  const hue = randomBetween(0, 360);
  const darkBackground = Math.random() > 0.25;

  return {
    accent: hslToHex(hue, 0.85, darkBackground ? 0.62 : 0.42),
    accent2: hslToHex((hue + 48) % 360, 0.78, darkBackground ? 0.7 : 0.45),
    bg: darkBackground
      ? hslToHex((hue + 195) % 360, 0.42, 0.075)
      : hslToHex((hue + 195) % 360, 0.5, 0.965),
    text: darkBackground ? "#e9edf7" : "#101a30",
    radius: Math.round(randomBetween(8, 28)),
    glow: Math.round(randomBetween(30, 85)),
  };
}

/** Serialise the palette to a ready-to-paste CSS block. */
export function buildPaletteCss(palette) {
  return `:root {
  --accent: ${palette.accent};
  --accent-2: ${palette.accent2};
  --bg: ${palette.bg};
  --text: ${palette.text};
  --radius: ${palette.radius}px;
  --glow-strength: ${(palette.glow / 100).toFixed(2)};
}`;
}

/** Apply the palette to the live preview element via CSS variables. */
export function applyPalette(palette, element) {
  if (!element) return;
  element.style.setProperty("--pv-accent", palette.accent);
  element.style.setProperty("--pv-accent-2", palette.accent2);
  element.style.setProperty("--pv-bg", palette.bg);
  element.style.setProperty("--pv-text", palette.text);
  element.style.setProperty("--pv-radius", `${palette.radius}px`);
  element.style.setProperty("--pv-glow", String(palette.glow / 100));
}

/** Live theme playground: colour inputs, radii, glow, export & persistence. */
import { copyText, storage, clamp } from "../lib/utils.js";
import {
  PALETTE_DEFAULTS,
  applyPalette,
  buildPaletteCss,
  randomPalette,
} from "../theme.js";

const PALETTE_KEY = "hw:palette";

const FIELDS = {
  accent: "pv-accent",
  accent2: "pv-accent2",
  bg: "pv-bg",
  text: "pv-text",
  radius: "pv-radius",
  glow: "pv-glow",
};

function isHex(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function sanitize(palette) {
  const source = palette && typeof palette === "object" ? palette : {};
  const merged = { ...PALETTE_DEFAULTS };

  for (const key of ["accent", "accent2", "bg", "text"]) {
    if (isHex(source[key])) merged[key] = source[key];
  }
  if (Number.isFinite(Number(source.radius))) merged.radius = clamp(Math.round(source.radius), 0, 36);
  if (Number.isFinite(Number(source.glow))) merged.glow = clamp(Math.round(source.glow), 0, 100);

  return merged;
}

function loadPalette() {
  const raw = storage.get(PALETTE_KEY);
  if (!raw) return { ...PALETTE_DEFAULTS };
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...PALETTE_DEFAULTS };
  }
}

export function initPlayground({ t, notify } = {}) {
  const preview = document.getElementById("preview");
  if (!preview) return null;

  const inputs = Object.fromEntries(
    Object.entries(FIELDS).map(([key, id]) => [key, document.getElementById(id)]),
  );

  const radiusLabel = document.getElementById("radius-value");
  const glowLabel = document.getElementById("glow-value");

  let palette = loadPalette();

  function syncInputs() {
    for (const key of ["accent", "accent2", "bg", "text"]) {
      if (inputs[key]) inputs[key].value = palette[key];
    }
    if (inputs.radius) inputs.radius.value = String(palette.radius);
    if (inputs.glow) inputs.glow.value = String(palette.glow);
  }

  function render({ persist = true } = {}) {
    applyPalette(palette, preview);
    if (radiusLabel) radiusLabel.textContent = String(palette.radius);
    if (glowLabel) glowLabel.textContent = String(palette.glow);
    if (persist) storage.set(PALETTE_KEY, JSON.stringify(palette));
  }

  function readInputs() {
    const next = { ...palette };
    for (const key of ["accent", "accent2", "bg", "text"]) {
      if (inputs[key] && isHex(inputs[key].value)) next[key] = inputs[key].value;
    }
    if (inputs.radius) next.radius = clamp(inputs.radius.value, 0, 36);
    if (inputs.glow) next.glow = clamp(inputs.glow.value, 0, 100);
    return next;
  }

  Object.values(inputs).forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      palette = readInputs();
      render();
    });
  });

  function setPalette(next, { announce = false } = {}) {
    palette = sanitize(next);
    syncInputs();
    render();
    if (announce) {
      notify?.({
        type: "info",
        title: t("toast.title.random"),
        message: t("toast.msg.randomTheme"),
      });
    }
  }

  function reset() {
    palette = { ...PALETTE_DEFAULTS };
    syncInputs();
    render();
    notify?.({ type: "info", message: t("toast.msg.reset") });
  }

  async function copyCss() {
    const ok = await copyText(buildPaletteCss(palette));
    notify?.({
      type: ok ? "success" : "error",
      title: ok ? t("toast.title.copied") : t("toast.title.error"),
      message: ok ? t("toast.msg.pvCopied") : t("toast.title.error"),
    });
    return ok;
  }

  document.getElementById("pv-random")?.addEventListener("click", () => setPalette(randomPalette(), { announce: true }));
  document.getElementById("pv-reset")?.addEventListener("click", reset);
  document.getElementById("pv-copy")?.addEventListener("click", copyCss);

  syncInputs();
  render({ persist: false });

  return {
    getPalette: () => ({ ...palette }),
    setPalette,
    reset,
    randomize: () => setPalette(randomPalette(), { announce: true }),
    copyCss,
    getCss: () => buildPaletteCss(palette),
  };
}

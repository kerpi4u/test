/**
 * Application entry point.
 * Wires the modules together; each feature lives in its own file under ./ui.
 */
import { GREETINGS, SNIPPETS } from "./data/snippets.js";
import { applyTranslations, getLang, onLangChange, otherLang, setLang, t } from "./i18n.js";
import { copyText } from "./lib/utils.js";
import { applyTheme, resolveInitialTheme, toggleTheme, watchSystemTheme } from "./theme.js";
import { initCopyButtons } from "./ui/copy.js";
import { initDemos } from "./ui/demos.js";
import { initMetrics } from "./ui/metrics.js";
import { initPalette } from "./ui/palette.js";
import { initParticles } from "./ui/particles.js";
import { initPlayground } from "./ui/playground.js";
import { initCardSpotlight, initReveal } from "./ui/reveal.js";
import { initSnippets } from "./ui/snippets-ui.js";
import { initTypewriter } from "./ui/typewriter.js";
import { toast } from "./ui/toast.js";

const notify = (options) => toast(options);

/* ----------------------------- theme & locale ---------------------------- */
applyTheme(resolveInitialTheme());
watchSystemTheme();

document.getElementById("theme-toggle")?.addEventListener("click", () => toggleTheme());
document.getElementById("lang-toggle")?.addEventListener("click", () => setLang(otherLang()));

/* -------------------------------- features ------------------------------- */
initReveal();
initParticles(document.getElementById("bg"));
initCardSpotlight();
initCopyButtons({ t, notify });
initTypewriter(document.getElementById("typewriter"), GREETINGS);

const snippetsUi = initSnippets(SNIPPETS, {
  t,
  onSelect: (snippet) => {
    document.getElementById("snippet-file").textContent = snippet.file;
  },
});

const playground = initPlayground({ t, notify });
initDemos({ t, notify });
initMetrics();

/* ---------------------------- command palette ---------------------------- */
function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", selector);
}

function buildCommands() {
  const sections = [
    ["features", "nav.features"],
    ["playground", "nav.playground"],
    ["snippets", "nav.snippets"],
    ["demos", "nav.demos"],
    ["metrics", "nav.metrics"],
  ];

  const commands = sections.map(([id, key]) => ({
    id: `goto-${id}`,
    icon: "section",
    title: t(key),
    subtitle: t("cmd.goto"),
    keywords: id,
    run: () => scrollToTarget(`#${id}`),
  }));

  commands.push(
    {
      id: "theme",
      icon: "theme",
      title: t("cmd.theme"),
      subtitle: t("cmd.theme.desc"),
      keywords: "dark light colour color",
      run: () => toggleTheme(),
    },
    {
      id: "lang",
      icon: "globe",
      title: t("cmd.lang"),
      subtitle: t("cmd.lang.desc"),
      keywords: "english russian язык locale",
      run: () => setLang(otherLang()),
    },
    {
      id: "copy-hero",
      icon: "copy",
      title: t("cmd.copyHero"),
      subtitle: t("cmd.copyHero.desc"),
      keywords: "clipboard js",
      run: async () => {
        const code = document.getElementById("hero-code")?.textContent || "";
        const ok = await copyText(code);
        notify({
          type: ok ? "success" : "error",
          title: t("toast.title.copied"),
          message: t("toast.msg.copied"),
        });
      },
    },
    {
      id: "random-theme",
      icon: "sparkle",
      title: t("cmd.randomTheme"),
      subtitle: t("cmd.randomTheme.desc"),
      keywords: "palette colour generator",
      run: () => playground?.randomize(),
    },
    {
      id: "reset-theme",
      icon: "reset",
      title: t("cmd.resetTheme"),
      subtitle: t("cmd.resetTheme.desc"),
      keywords: "defaults palette",
      run: () => playground?.reset(),
    },
    {
      id: "top",
      icon: "top",
      title: t("cmd.top"),
      subtitle: t("cmd.top.desc"),
      keywords: "home scroll start",
      run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      id: "github",
      icon: "github",
      title: t("cmd.github"),
      subtitle: t("cmd.github.desc"),
      keywords: "source repository git",
      run: () => window.open("https://github.com/kerpi4u/test", "_blank", "noopener"),
    },
  );

  for (const snippet of SNIPPETS) {
    commands.push({
      id: `snippet-${snippet.id}`,
      icon: "code",
      title: t("cmd.snippet", { lang: snippet.name }),
      subtitle: snippet.file,
      keywords: `${snippet.name} ${snippet.id} code example hello world`,
      run: () => {
        snippetsUi?.select(snippet.id);
        scrollToTarget("#snippets");
        document.getElementById("lang-tabs")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
    });
  }

  return commands;
}

initPalette({ getCommands: buildCommands });

/* ------------------------------- housekeeping ---------------------------- */
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

onLangChange(() => {
  // Re-apply translations to dynamically rendered parts (errors are cleared on demand).
  applyTranslations();
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("[sw] registration failed", error);
    });
  });
}

// A small easter egg for the ones who open DevTools.
console.log(
  "%c hello.world %c 0 deps · 20 languages · 100 Lighthouse ",
  "background: linear-gradient(90deg,#22d3ee,#a78bfa);color:#04121a;font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#111827;color:#e5e7eb;border-radius:0 4px 4px 0;padding:2px 6px",
);
console.log("Locale:", getLang(), "· ready.");

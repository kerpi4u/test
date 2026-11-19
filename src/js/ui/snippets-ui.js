/** Language tabs + rendered, highlighted snippets. */
import { highlight } from "../lib/highlight.js";

export function initSnippets(snippets, { t, onSelect } = {}) {
  const tabs = document.getElementById("lang-tabs");
  const code = document.getElementById("snippet-code");
  const file = document.getElementById("snippet-file");
  if (!tabs || !code || !file) return null;

  let currentId = snippets[0]?.id;

  function current() {
    return snippets.find((snippet) => snippet.id === currentId) || snippets[0];
  }

  function renderCode() {
    const snippet = current();
    if (!snippet) return;
    code.innerHTML = highlight(snippet.code, { keywords: snippet.keywords, lang: snippet.id });
    file.textContent = snippet.file;
    onSelect?.(snippet);
  }

  function select(id, { focus = false } = {}) {
    if (!snippets.some((snippet) => snippet.id === id)) return;
    currentId = id;

    [...tabs.querySelectorAll('[role="tab"]')].forEach((tab) => {
      const active = tab.dataset.lang === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });

    renderCode();
  }

  snippets.forEach((snippet) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tab";
    tab.id = `tab-${snippet.id}`;
    tab.dataset.lang = snippet.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "snippet-code");
    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = -1;
    tab.textContent = snippet.name;
    tab.addEventListener("click", () => select(snippet.id));
    tabs.appendChild(tab);
  });

  tabs.addEventListener("keydown", (event) => {
    const index = snippets.findIndex((snippet) => snippet.id === currentId);
    if (index < 0) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(snippets[(index + 1) % snippets.length].id, { focus: true });
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(snippets[(index - 1 + snippets.length) % snippets.length].id, { focus: true });
    } else if (event.key === "Home") {
      event.preventDefault();
      select(snippets[0].id, { focus: true });
    } else if (event.key === "End") {
      event.preventDefault();
      select(snippets[snippets.length - 1].id, { focus: true });
    }
  });

  document.getElementById("snippet-random")?.addEventListener("click", () => {
    const pool = snippets.filter((snippet) => snippet.id !== currentId);
    const next = pool[Math.floor(Math.random() * pool.length)] || current();
    select(next.id);
    tabs.querySelector(`[data-lang="${next.id}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  });

  select(currentId);

  return {
    select,
    getCurrent: current,
    getCurrentId: () => currentId,
    refresh: () => renderCode(),
  };
}

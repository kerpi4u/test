/** ⌘K command palette: fuzzy search, keyboard navigation, focus restore. */
import { rank } from "../lib/fuzzy.js";
import { trapFocus } from "../lib/utils.js";

const ICONS = {
  search:
    '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  theme: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  top: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  github:
    '<path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  code: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6"/>',
  section: '<path d="M4 6h16M4 12h10M4 18h7"/>',
};

function iconSvg(name) {
  const path = ICONS[name] || ICONS.search;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

export function initPalette({ getCommands }) {
  const root = document.getElementById("palette");
  const input = document.getElementById("palette-input");
  const list = document.getElementById("palette-list");
  const empty = document.getElementById("palette-empty");
  const panel = root?.querySelector(".palette-panel");
  if (!root || !input || !list || !panel) return { open() {}, close() {} };

  let visible = [];
  let activeIndex = 0;
  let lastFocused = null;
  let releaseTrap = null;

  function commands() {
    return getCommands().filter((command) => command && command.title);
  }

  function render(query = "") {
    const all = commands();
    const results = query.trim() ? rank(query, all, (c) => `${c.title} ${c.subtitle || ""} ${c.keywords || ""}`) : all.map((item) => ({ item, score: 0 }));

    visible = results.map((entry) => entry.item);
    activeIndex = Math.min(activeIndex, Math.max(0, visible.length - 1));
    list.innerHTML = "";

    visible.forEach((command, index) => {
      const li = document.createElement("li");
      li.className = "palette-item";
      li.id = `palette-item-${index}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(index === activeIndex));
      li.dataset.index = String(index);

      const icon = document.createElement("span");
      icon.className = "palette-icon";
      icon.innerHTML = iconSvg(command.icon);

      const text = document.createElement("span");
      text.className = "palette-text";

      const title = document.createElement("b");
      title.textContent = command.title;
      text.appendChild(title);

      if (command.subtitle) {
        const subtitle = document.createElement("small");
        subtitle.textContent = command.subtitle;
        text.appendChild(subtitle);
      }

      const hint = document.createElement("span");
      hint.className = "palette-hint";
      hint.textContent = "↵";

      li.append(icon, text, hint);

      li.addEventListener("mousemove", () => setActive(index, false));
      li.addEventListener("click", () => run(index));

      list.appendChild(li);
    });

    empty.hidden = visible.length > 0;
    input.setAttribute("aria-activedescendant", visible.length ? `palette-item-${activeIndex}` : "");
    syncSelection();
  }

  function syncSelection() {
    [...list.children].forEach((child, index) => {
      const selected = index === activeIndex;
      child.setAttribute("aria-selected", String(selected));
      if (selected) child.scrollIntoView({ block: "nearest" });
    });
  }

  function setActive(index, moveFocus = false) {
    if (!visible.length) return;
    activeIndex = (index + visible.length) % visible.length;
    input.setAttribute("aria-activedescendant", `palette-item-${activeIndex}`);
    syncSelection();
    if (moveFocus) input.focus();
  }

  function run(index = activeIndex) {
    const command = visible[index];
    if (!command) return;
    close();
    requestAnimationFrame(() => {
      try {
        command.run();
      } catch (error) {
        console.error("[palette] command failed", error);
      }
    });
  }

  function open() {
    if (!root.hidden) return;
    lastFocused = document.activeElement;
    activeIndex = 0;
    root.hidden = false;
    input.value = "";
    render("");
    input.focus();
    releaseTrap = trapFocus(panel, { onEscape: close });
    document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("palette:open"));
  }

  function close() {
    if (root.hidden) return;
    root.hidden = true;
    document.body.style.overflow = "";
    releaseTrap?.();
    releaseTrap = null;
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    document.dispatchEvent(new CustomEvent("palette:close"));
  }

  input.addEventListener("input", () => {
    activeIndex = 0;
    render(input.value);
  });

  input.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive(activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(visible.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        run();
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      default:
        break;
    }
  });

  root.addEventListener("mousedown", (event) => {
    if (event.target === root) close();
  });

  document.addEventListener("keydown", (event) => {
    const isPaletteShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (isPaletteShortcut) {
      event.preventDefault();
      if (root.hidden) open();
      else close();
      return;
    }

    // Ctrl/Cmd+P is a familiar alternative that also avoids browser search.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      open();
    }
  });

  document.getElementById("cmd-open")?.addEventListener("click", open);
  document.getElementById("hero-cmd")?.addEventListener("click", open);

  return { open, close, render };
}

/** Lightweight toast notifications with a queue and manual dismissal. */

const ICONS = {
  success: "✓",
  info: "i",
  warn: "!",
  error: "×",
};

const MAX_VISIBLE = 4;

export function toast({ type = "info", title = "", message = "", duration = 4200 } = {}) {
  const stack = document.getElementById("toasts");
  if (!stack) return () => {};

  while (stack.children.length >= MAX_VISIBLE) {
    stack.firstElementChild?.remove();
  }

  const node = document.createElement("div");
  node.className = `toast toast--${type}`;
  node.setAttribute("role", type === "error" ? "alert" : "status");

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = ICONS[type] || ICONS.info;

  const body = document.createElement("div");
  body.className = "toast-body";

  if (title) {
    const heading = document.createElement("strong");
    heading.textContent = title;
    body.appendChild(heading);
  }

  if (message) {
    const text = document.createElement("span");
    text.textContent = message;
    body.appendChild(text);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", "Закрыть уведомление");
  close.textContent = "×";

  let timer;

  function dismiss() {
    clearTimeout(timer);
    if (!node.isConnected) return;
    node.classList.add("is-leaving");
    node.addEventListener("animationend", () => node.remove(), { once: true });
    // Safety net when animations are disabled.
    setTimeout(() => node.remove(), 400);
  }

  close.addEventListener("click", dismiss);
  node.append(icon, body, close);
  stack.appendChild(node);

  // Pause the countdown while the pointer is over the toast.
  timer = setTimeout(dismiss, duration);
  node.addEventListener("mouseenter", () => clearTimeout(timer));
  node.addEventListener("mouseleave", () => {
    timer = setTimeout(dismiss, Math.min(duration, 2200));
  });

  return dismiss;
}

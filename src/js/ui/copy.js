/** Delegated copy-to-clipboard behaviour for every `[data-copy-target]` button. */
import { copyText } from "../lib/utils.js";

export function initCopyButtons({ t, notify } = {}) {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-target]");
    if (!button) return;

    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;

    const text = target.textContent;
    const ok = await copyText(text);

    const label = button.querySelector("[data-i18n]") || button.querySelector("span");
    if (label) {
      const original = label.dataset.i18n ? t(label.dataset.i18n) : label.textContent;
      label.textContent = t("common.copied");
      button.classList.add("is-copied");
      setTimeout(() => {
        label.textContent = original;
        button.classList.remove("is-copied");
      }, 1800);
    }

    notify?.({
      type: ok ? "success" : "error",
      title: ok ? t("toast.title.copied") : t("toast.title.error"),
      message: ok ? t("toast.msg.copied") : t("toast.title.error"),
    });
  });
}

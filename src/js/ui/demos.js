/** Interactive component demos: validation, toasts, progress, modal. */
import { clamp } from "../lib/utils.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initDemos({ t, notify } = {}) {
  initForm({ t, notify });
  initToastButtons({ t, notify });
  initProgress({ t });
  initModal();
}

function initForm({ t, notify }) {
  const form = document.getElementById("demo-form");
  if (!form) return;

  const name = document.getElementById("f-name");
  const email = document.getElementById("f-email");
  const nameField = document.getElementById("field-name");
  const emailField = document.getElementById("field-email");
  const nameError = document.getElementById("err-name");
  const emailError = document.getElementById("err-email");

  function validateName({ silent = false } = {}) {
    const valid = name.value.trim().length >= 2;
    nameField.classList.toggle("has-error", !valid);
    nameError.textContent = valid || silent ? "" : t("demos.form.err.name");
    name.setAttribute("aria-invalid", String(!valid));
    return valid;
  }

  function validateEmail({ silent = false } = {}) {
    const valid = EMAIL_RE.test(email.value.trim());
    emailField.classList.toggle("has-error", !valid);
    emailError.textContent = valid || silent ? "" : t("demos.form.err.email");
    email.setAttribute("aria-invalid", String(!valid));
    return valid;
  }

  name.addEventListener("blur", () => validateName());
  email.addEventListener("blur", () => validateEmail());
  name.addEventListener("input", () => nameField.classList.contains("has-error") && validateName());
  email.addEventListener("input", () => emailField.classList.contains("has-error") && validateEmail());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const okName = validateName();
    const okEmail = validateEmail();

    if (!okName || !okEmail) {
      notify?.({
        type: "error",
        title: t("toast.title.error"),
        message: t("toast.msg.formError"),
      });
      (!okName ? name : email).focus();
      return;
    }

    notify?.({
      type: "success",
      title: t("toast.title.success"),
      message: t("toast.msg.form", { name: name.value.trim(), email: email.value.trim() }),
    });

    form.reset();
    [nameField, emailField].forEach((field) => field.classList.remove("has-error"));
    [nameError, emailError].forEach((node) => (node.textContent = ""));
    [name, email].forEach((input) => input.removeAttribute("aria-invalid"));
  });

  form.addEventListener("reset", () => {
    [nameField, emailField].forEach((field) => field.classList.remove("has-error"));
    [nameError, emailError].forEach((node) => (node.textContent = ""));
    [name, email].forEach((input) => input.removeAttribute("aria-invalid"));
  });
}

function initToastButtons({ t, notify }) {
  document.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.toast;
      notify?.({
        type,
        title: t(`toast.title.${type}`),
        message: t(`toast.msg.${type}`),
      });
    });
  });
}

function initProgress({ t }) {
  const fill = document.getElementById("progress-fill");
  const bar = document.getElementById("progress");
  const run = document.getElementById("progress-run");
  const skeleton = document.getElementById("skeleton");
  const skeletonToggle = document.getElementById("skeleton-toggle");
  if (!fill || !bar || !run) return;

  let timer = null;

  function setValue(value) {
    const next = clamp(Math.round(value), 0, 100);
    fill.style.width = `${next}%`;
    bar.setAttribute("aria-valuenow", String(next));
  }

  run.addEventListener("click", () => {
    if (timer) return;
    run.disabled = true;
    setValue(0);

    let value = 0;
    timer = setInterval(() => {
      value += 4 + Math.random() * 9;
      if (value >= 100) {
        setValue(100);
        clearInterval(timer);
        timer = null;
        run.disabled = false;
        return;
      }
      setValue(value);
    }, 120);
  });

  skeletonToggle?.addEventListener("click", () => {
    const willShow = skeleton.hidden;
    skeleton.hidden = !willShow;
    skeletonToggle.setAttribute("aria-pressed", String(willShow));
  });
}

function initModal() {
  const dialog = document.getElementById("demo-modal");
  const open = document.getElementById("modal-open");
  if (!dialog || !open) return;

  open.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  ["modal-close", "modal-cancel", "modal-ok"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => dialog.close());
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

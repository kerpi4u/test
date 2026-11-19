/**
 * A ~60-line syntax highlighter.
 *
 * No Prism, no highlight.js, no WASM — one regex per language tuned for the
 * snippets we ship. Everything is escaped before it reaches the DOM, so the
 * output is safe to inject with innerHTML.
 */
import { escapeHtml } from "./utils.js";

// Kept raw so the escaping stays readable: not a quote, not a backslash, not a newline.
const STRING_PATTERN = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'`;

const HASH_COMMENT_LANGS = new Set(["python", "ruby", "bash", "elixir", "php"]);
const DASH_COMMENT_LANGS = new Set(["sql", "haskell", "lua"]);

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} code raw source
 * @param {{ keywords?: string[], lang?: string }} options
 * @returns {string} highlighted HTML
 */
export function highlight(code, { keywords = [], lang = "" } = {}) {
  const source = String(code);
  const patterns = [];

  // Block comments and // line comments work in most C-like languages.
  patterns.push("\\/\\*[\\s\\S]*?\\*\\/");
  patterns.push("\\/\\/[^\\n]*");

  if (HASH_COMMENT_LANGS.has(lang)) {
    patterns.push("#(?!include\\b|!)[^\\n]*");
  }
  if (DASH_COMMENT_LANGS.has(lang)) {
    patterns.push("--[^\\n]*");
  }

  const keywordList = [...keywords].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const keywordPattern = keywordList.length ? `\\b(?:${keywordList.join("|")})\\b` : null;

  const regex = new RegExp(
    [
      `(?<comment>${patterns.join("|")})`,
      `(?<string>${STRING_PATTERN})`,
      `(?<number>\\b\\d+(?:\\.\\d+)?\\b)`,
      keywordPattern ? `(?<keyword>${keywordPattern})` : null,
      `(?<fn>\\b[A-Za-z_$][\\w$]*(?=\\s*\\())`,
    ]
      .filter(Boolean)
      .join("|"),
    "gi",
  );

  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      html += escapeHtml(source.slice(lastIndex, match.index));
    }

    const raw = match[0];
    const groups = match.groups || {};
    const className = groups.comment
      ? "tok-com"
      : groups.string
        ? "tok-str"
        : groups.number
          ? "tok-num"
          : groups.keyword
            ? "tok-key"
            : "tok-fn";

    html += `<span class="${className}">${escapeHtml(raw)}</span>`;
    lastIndex = match.index + raw.length;
  }

  html += escapeHtml(source.slice(lastIndex));
  return html;
}

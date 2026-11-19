/**
 * Pure translation helper (no DOM), shared by the runtime and the tests.
 *
 * Lookup order: requested locale → English → Russian → the key itself.
 * `{placeholders}` are replaced only when a matching variable was provided.
 */
export function translate(dictionaries, lang, key, vars = {}) {
  const preferred = dictionaries[lang] || {};
  const template =
    preferred[key] ??
    dictionaries.en?.[key] ??
    dictionaries.ru?.[key] ??
    key;

  return String(template).replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

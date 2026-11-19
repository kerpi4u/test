/**
 * Tiny fuzzy matcher for the command palette.
 *
 * Rules:
 *  - characters of the query must appear in order (subsequence match);
 *  - consecutive characters and word starts score higher;
 *  - matching is case- and diacritic-insensitive.
 *
 * The function is pure so it can be unit-tested in Node.
 */

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    // Fold accents for Latin text only: Cyrillic "й" must survive.
    .replace(/(?<=[a-zA-Z])[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

const WORD_START = /[\s\-_/.:([{]/;

/**
 * @param {string} query
 * @param {string} text
 * @returns {{ score: number, indices: number[] } | null}
 */
export function fuzzyMatch(query, text) {
  const needle = normalize(query).replace(/\s+/g, " ").trim();
  const haystack = normalize(text);

  if (!needle) return { score: 0, indices: [] };
  if (needle.length > haystack.length) return null;

  let score = 0;
  let cursor = 0;
  let previousIndex = -1;
  const indices = [];

  for (const char of needle) {
    if (char === " ") continue;

    const found = haystack.indexOf(char, cursor);
    if (found === -1) return null;

    indices.push(found);
    score += 1;

    if (found === previousIndex + 1) score += 6; // consecutive run
    if (found === 0) score += 8;
    else if (WORD_START.test(haystack[found - 1])) score += 4;

    previousIndex = found;
    cursor = found + 1;
  }

  // Prefer shorter haystacks and earlier matches.
  score += Math.max(0, 12 - (haystack.length - needle.length) * 0.15);
  score -= indices[0] * 0.1;

  return { score, indices };
}

/**
 * Rank a list of items by relevance.
 * @template T
 * @param {string} query
 * @param {T[]} items
 * @param {(item: T) => string} toText
 * @returns {{ item: T, score: number }[]}
 */
export function rank(query, items, toText) {
  return items
    .map((item) => ({ item, match: fuzzyMatch(query, toText(item)) }))
    .filter((entry) => entry.match)
    .sort((a, b) => b.match.score - a.match.score)
    .map(({ item, match }) => ({ item, score: match.score }));
}

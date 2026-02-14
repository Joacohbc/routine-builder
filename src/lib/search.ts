/**
 * Normalizes a string by removing accents/diacritics and converting to lowercase.
 * Example: "Crème Brûlée" -> "creme brulee"
 */
export function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Calculates the Levenshtein distance between two strings.
 * This is the minimum number of single-character edits (insertions, deletions or substitutions)
 * required to change one word into the other.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Filters an array of items based on a fuzzy search query.
 *
 * @param items The array of items to filter.
 * @param query The search query string.
 * @param getSearchableText A function that extracts an array of searchable strings from an item.
 * @returns The filtered array of items.
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string[]
): T[] {
  const normalizedQuery = normalizeString(query);

  if (!normalizedQuery) {
    return items;
  }

  // Calculate dynamic threshold based on query length
  // e.g., length 3-5: 1 edit allowed
  // length > 5: 2 edits allowed
  const threshold = normalizedQuery.length > 5 ? 2 : 1;

  return items.filter((item) => {
    const searchableTexts = getSearchableText(item);

    return searchableTexts.some((text) => {
      if (!text) return false;
      const normalizedText = normalizeString(text);

      // 1. Exact substring match (includes) - always the strongest signal
      if (normalizedText.includes(normalizedQuery)) {
        return true;
      }

      // 2. Levenshtein distance check
      // Only check distance if query is long enough (>= 3 chars) to avoid false positives
      if (normalizedQuery.length >= 3) {

        // Check individual words for fuzzy match (e.g. "sqat" matches "Squat" in "Back Squat")
        const words = normalizedText.split(/\s+/);
        for (const word of words) {
           // Skip short words to avoid noise
           if (word.length < 3) continue;

           if (levenshteinDistance(word, normalizedQuery) <= threshold) {
             return true;
           }
        }

        // Check full phrase if it's reasonably short (e.g. "leg press" vs "leg prss")
        if (normalizedText.length < 50 && levenshteinDistance(normalizedText, normalizedQuery) <= threshold) {
            return true;
        }
      }

      return false;
    });
  });
}

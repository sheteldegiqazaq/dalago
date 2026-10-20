/**
 * Простейший стемминг для русского и казахского: обрезаем окончания,
 * чтобы «говядины» находило «говядина», а «картофеля» — «картофель».
 */
export function toSearchTerms(query: string | undefined): string[] {
  if (!query) {
    return [];
  }

  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3);

  const stems = words.map((word) =>
    word.length >= 7
      ? word.slice(0, -2)
      : word.length === 6
        ? word.slice(0, -1)
        : word,
  );

  return [...new Set(stems)].slice(0, 8);
}

export function buildSearchText(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Чем больше терминов совпало, и особенно в названии, тем выше товар. */
export function scoreMatch(
  terms: string[],
  item: { title: string; titleKk: string | null; searchText: string },
): number {
  const title = `${item.title} ${item.titleKk ?? ''}`.toLowerCase();

  return terms.reduce((score, term) => {
    if (title.includes(term)) {
      return score + 3;
    }

    return item.searchText.includes(term) ? score + 1 : score;
  }, 0);
}

import type {
  CatalogContext,
  ListingDraft,
  SearchIntent,
} from '../ports/ai-assistant';

const hasDigits = (text: string) => /\d/.test(text);

/**
 * Последняя линия защиты от выдумок: значения вне справочников обнуляются,
 * числа без цифр в исходном тексте — тоже.
 */
export function sanitizeListing(
  draft: ListingDraft,
  text: string,
  context: CatalogContext,
): ListingDraft {
  const categories = new Set(context.categories.map((c) => c.slug));
  const cities = new Set(context.cities.map((c) => c.id));

  return {
    ...draft,
    title: draft.title.trim().slice(0, 120),
    categorySlug:
      draft.categorySlug && categories.has(draft.categorySlug)
        ? draft.categorySlug
        : null,
    cityId: draft.cityId && cities.has(draft.cityId) ? draft.cityId : null,
    price: hasDigits(text) ? draft.price : null,
    quantity: hasDigits(text) ? draft.quantity : null,
    tags: [
      ...new Set(draft.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
    ].slice(0, 6),
  };
}

export function sanitizeIntent(
  intent: SearchIntent,
  context: CatalogContext,
): SearchIntent {
  const categories = new Set(context.categories.map((c) => c.slug));
  const cities = new Set(context.cities.map((c) => c.id));

  return {
    ...intent,
    keywords: intent.keywords
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length >= 2)
      .slice(0, 6),
    categorySlug:
      intent.categorySlug && categories.has(intent.categorySlug)
        ? intent.categorySlug
        : null,
    cityId: intent.cityId && cities.has(intent.cityId) ? intent.cityId : null,
    regionId: intent.regionId === 'abai' ? 'abai' : null,
  };
}

export function missingListingFields(draft: ListingDraft): string[] {
  const checks: Array<[string, unknown]> = [
    ['categorySlug', draft.categorySlug],
    ['price', draft.price],
    ['quantity', draft.quantity],
    ['unit', draft.unit],
    ['cityId', draft.cityId],
  ];

  return checks.filter(([, value]) => value === null).map(([field]) => field);
}

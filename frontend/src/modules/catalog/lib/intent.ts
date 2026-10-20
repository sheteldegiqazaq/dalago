import type {
  AiSearchResponseDto,
  SearchIntentDto,
} from "@/shared/api/generated";

import type { CatalogFilterValues } from "../model/use-catalog-filters";

/**
 * Переводит понятый ИИ запрос в обычные фильтры каталога.
 * Если бэкенд ослабил условия (relaxed), повторяем это и в фильтрах,
 * чтобы каталог показал те же товары, что и ИИ.
 */
export function intentToFilters(
  intent: SearchIntentDto,
  relaxed: boolean,
): Omit<CatalogFilterValues, "page"> {
  return {
    q: "",
    kw: intent.keywords.join(" ") || null,
    category: intent.categorySlug,
    city: relaxed ? null : intent.cityId,
    region: intent.regionId,
    minPrice: relaxed ? null : intent.minPrice,
    maxPrice: relaxed ? null : intent.maxPrice,
    quantity: relaxed ? null : intent.quantity,
    unit: relaxed ? null : intent.unit,
    delivery: relaxed ? false : intent.deliveryRequired,
    sort: intent.keywords.length > 0 ? "relevance" : "price_asc",
  };
}

/** Параметры для формы заявки, если подходящих товаров нет. */
export function intentToRequestQuery(
  query: string,
  result: Pick<AiSearchResponseDto, "intent">,
  categoryId: string | undefined,
): Record<string, string> {
  const { intent } = result;
  const params: Record<string, string> = { title: query.slice(0, 120) };

  if (categoryId) params.categoryId = categoryId;
  if (intent.quantity) params.quantity = String(intent.quantity);
  if (intent.unit) params.unit = intent.unit;
  if (intent.cityId) params.city = intent.cityId;
  if (intent.maxPrice) params.targetPrice = String(intent.maxPrice);
  if (intent.neededBy) params.date = intent.neededBy;

  return params;
}

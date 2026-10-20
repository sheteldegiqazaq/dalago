import type { ProductsFacade } from '@modules/products';
import type { SearchIntent } from '../ports/ai-assistant';
import type { AiRunner } from '../services/ai-runner';
import type { CatalogContextProvider } from '../services/catalog-context';
import { sanitizeIntent } from '../services/draft-sanitizer';

const RESULT_LIMIT = 12;

export class AiSearchUseCase {
  constructor(
    private readonly runner: AiRunner,
    private readonly catalog: CatalogContextProvider,
    private readonly products: ProductsFacade,
  ) {}

  /** ИИ только понимает запрос; товары всегда берутся из нашей базы. */
  async execute(query: string) {
    const context = await this.catalog.get();
    const { result, mode, notice } = await this.runner.run((assistant) =>
      assistant.parseSearch(query, context),
    );
    const intent = sanitizeIntent(result, context);

    // Товар не распознан — не показываем весь каталог как «результат ИИ».
    if (intent.keywords.length === 0 && !intent.categorySlug) {
      return {
        mode,
        notice,
        intent,
        relaxed: false,
        items: [],
        total: 0,
        page: 1,
        limit: RESULT_LIMIT,
      };
    }

    const strict = await this.search(intent);

    if (strict.total > 0 || !this.canRelax(intent)) {
      return { mode, notice, intent, relaxed: false, ...strict };
    }

    // Ничего не нашли — ослабляем цену, объём и город, но оставляем сам товар.
    const relaxed = await this.search({
      ...intent,
      maxPrice: null,
      minPrice: null,
      quantity: null,
      cityId: null,
      deliveryRequired: false,
    });

    return { mode, notice, intent, relaxed: relaxed.total > 0, ...relaxed };
  }

  private canRelax(intent: SearchIntent) {
    return (
      (intent.keywords.length > 0 || Boolean(intent.categorySlug)) &&
      Boolean(
        intent.maxPrice ??
        intent.minPrice ??
        intent.quantity ??
        intent.cityId ??
        intent.deliveryRequired,
      )
    );
  }

  private search(intent: SearchIntent) {
    return this.products.search({
      // Если категория определена, ищем по ней; ключевые слова уточняют порядок.
      keywords: intent.keywords,
      categorySlug: intent.categorySlug ?? undefined,
      cityId: intent.cityId ?? undefined,
      regionId: intent.regionId ?? undefined,
      minPrice: intent.minPrice ?? undefined,
      maxPrice: intent.maxPrice ?? undefined,
      quantity: intent.quantity
        ? { value: intent.quantity, unit: intent.unit ?? undefined }
        : undefined,
      deliveryOnly: intent.deliveryRequired,
      sort: intent.keywords.length > 0 ? 'relevance' : 'price_asc',
      page: 1,
      limit: RESULT_LIMIT,
    });
  }
}

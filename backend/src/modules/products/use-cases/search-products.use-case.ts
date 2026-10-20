import type { ProductRepository } from '../repositories/product.repository';
import { toSearchTerms } from '../services/search-terms';
import type { ProductSearchCriteria } from '../types/product.type';

export type SearchProductsQuery = Omit<ProductSearchCriteria, 'terms'> & {
  q?: string;
  keywords?: string[];
};

export class SearchProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(query: SearchProductsQuery) {
    const { q, keywords, ...criteria } = query;
    const terms = [
      ...new Set([
        ...toSearchTerms(q),
        ...(keywords ?? []).flatMap(toSearchTerms),
      ]),
    ];

    return this.products.search({ ...criteria, terms });
  }
}

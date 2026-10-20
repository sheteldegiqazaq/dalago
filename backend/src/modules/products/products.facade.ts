import { Injectable } from '@nestjs/common';
import { ProductResponseMapper } from './mappers/product-response.mapper';
import {
  type SearchProductsQuery,
  SearchProductsUseCase,
} from './use-cases/search-products.use-case';

@Injectable()
export class ProductsFacade {
  constructor(private readonly searchProducts: SearchProductsUseCase) {}

  /** Поиск по реальной базе (используется ИИ-поиском). */
  async search(query: SearchProductsQuery) {
    const page = await this.searchProducts.execute(query);

    return {
      ...page,
      items: page.items.map((p) => ProductResponseMapper.toListItem(p)),
    };
  }
}

export type { SearchProductsQuery };

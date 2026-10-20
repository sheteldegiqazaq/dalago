import type { ReferenceFacade } from '@modules/reference';
import type { CatalogContext } from '../ports/ai-assistant';

export class CatalogContextProvider {
  constructor(private readonly reference: ReferenceFacade) {}

  async get(): Promise<CatalogContext> {
    const [categories, cities] = await Promise.all([
      this.reference.listCategories(),
      this.reference.listCities(),
    ]);

    return {
      categories: categories.map(({ slug, nameRu, nameKk }) => ({
        slug,
        nameRu,
        nameKk,
      })),
      cities: cities.map(({ id, nameRu, nameKk }) => ({ id, nameRu, nameKk })),
      today: new Date().toISOString().slice(0, 10),
    };
  }
}

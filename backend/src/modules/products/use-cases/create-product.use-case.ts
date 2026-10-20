import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { ProductRepository } from '../repositories/product.repository';
import { assertValidProduct } from '../services/product-rules';
import type { ProductWriteData } from '../types/product.type';

export class CreateProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(companyId: string | undefined, data: ProductWriteData) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    const normalized = normalize(data);
    await assertValidProduct(this.products, normalized);

    return this.products.create(companyId, normalized);
  }
}

export function normalize(data: ProductWriteData): ProductWriteData {
  return {
    ...data,
    title: data.title.trim(),
    titleKk: data.titleKk?.trim() || null,
    description: data.description.trim(),
    descriptionKk: data.descriptionKk?.trim() || null,
    imageUrl: data.imageUrl?.trim() || null,
    tags: [
      ...new Set(
        data.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      ),
    ].slice(0, 12),
  };
}

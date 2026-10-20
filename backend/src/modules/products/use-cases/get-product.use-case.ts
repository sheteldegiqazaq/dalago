import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProductRepository } from '../repositories/product.repository';

export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string, viewerCompanyId?: string) {
    const product = await this.products.findById(id);
    const isOwner = product?.supplierCompanyId === viewerCompanyId;

    // Снятые с публикации объявления видит только владелец.
    if (!product || (product.status !== 'ACTIVE' && !isOwner)) {
      throw new NotFoundApplicationException(
        'Товар не найден',
        'PRODUCT_NOT_FOUND',
      );
    }

    return { product, isOwner };
  }
}

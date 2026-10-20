import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProductRepository } from '../repositories/product.repository';

export class ProductOwnership {
  constructor(private readonly products: ProductRepository) {}

  /** Возвращает товар, только если он принадлежит компании пользователя. */
  async requireOwned(productId: string, companyId: string | undefined) {
    const product = await this.products.findById(productId);

    if (!product) {
      throw new NotFoundApplicationException(
        'Товар не найден',
        'PRODUCT_NOT_FOUND',
      );
    }

    if (!companyId || product.supplierCompanyId !== companyId) {
      throw new ForbiddenApplicationException(
        'Можно изменять только свои объявления',
        'NOT_PRODUCT_OWNER',
      );
    }

    return product;
  }
}

import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { ProductRepository } from '../repositories/product.repository';

export class ListMyProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(companyId: string | undefined) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    return this.products.listBySupplier(companyId);
  }
}

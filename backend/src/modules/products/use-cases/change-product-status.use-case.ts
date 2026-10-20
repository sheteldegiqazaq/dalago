import type { ProductStatus } from '@generated/prisma/client';
import type { ProductRepository } from '../repositories/product.repository';
import type { ProductOwnership } from '../services/product-ownership';

export class ChangeProductStatusUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly ownership: ProductOwnership,
  ) {}

  async execute(
    productId: string,
    companyId: string | undefined,
    status: ProductStatus,
  ) {
    await this.ownership.requireOwned(productId, companyId);

    return this.products.setStatus(productId, status);
  }
}

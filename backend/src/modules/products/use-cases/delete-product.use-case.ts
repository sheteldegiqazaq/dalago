import type { ProductRepository } from '../repositories/product.repository';
import type { ProductOwnership } from '../services/product-ownership';

export class DeleteProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly ownership: ProductOwnership,
  ) {}

  async execute(productId: string, companyId: string | undefined) {
    await this.ownership.requireOwned(productId, companyId);
    await this.products.delete(productId);
  }
}

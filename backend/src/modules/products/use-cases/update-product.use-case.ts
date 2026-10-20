import type { ProductRepository } from '../repositories/product.repository';
import type { ProductOwnership } from '../services/product-ownership';
import { assertValidProduct } from '../services/product-rules';
import type { ProductWriteData } from '../types/product.type';
import { normalize } from './create-product.use-case';

export class UpdateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly ownership: ProductOwnership,
  ) {}

  async execute(
    productId: string,
    companyId: string | undefined,
    data: ProductWriteData,
  ) {
    await this.ownership.requireOwned(productId, companyId);
    const normalized = normalize(data);
    await assertValidProduct(this.products, normalized);

    return this.products.update(productId, normalized);
  }
}

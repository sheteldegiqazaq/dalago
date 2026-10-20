import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { PrismaProductRepository } from './repositories/prisma-product.repository';
import type { ProductRepository } from './repositories/product.repository';
import { PRODUCT_REPOSITORY } from './products.tokens';
import { ProductsFacade } from './products.facade';
import { ProductOwnership } from './services/product-ownership';
import { ChangeProductStatusUseCase } from './use-cases/change-product-status.use-case';
import { CreateProductUseCase } from './use-cases/create-product.use-case';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';
import { GetProductUseCase } from './use-cases/get-product.use-case';
import { ListMyProductsUseCase } from './use-cases/list-my-products.use-case';
import { SearchProductsUseCase } from './use-cases/search-products.use-case';
import { UpdateProductUseCase } from './use-cases/update-product.use-case';

const withRepository = <T>(factory: (products: ProductRepository) => T) => ({
  useFactory: factory,
  inject: [PRODUCT_REPOSITORY],
});

const withOwnership = <T>(
  factory: (products: ProductRepository, ownership: ProductOwnership) => T,
) => ({
  useFactory: factory,
  inject: [PRODUCT_REPOSITORY, ProductOwnership],
});

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsFacade,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    {
      provide: ProductOwnership,
      ...withRepository((products) => new ProductOwnership(products)),
    },
    {
      provide: SearchProductsUseCase,
      ...withRepository((products) => new SearchProductsUseCase(products)),
    },
    {
      provide: GetProductUseCase,
      ...withRepository((products) => new GetProductUseCase(products)),
    },
    {
      provide: ListMyProductsUseCase,
      ...withRepository((products) => new ListMyProductsUseCase(products)),
    },
    {
      provide: CreateProductUseCase,
      ...withRepository((products) => new CreateProductUseCase(products)),
    },
    {
      provide: UpdateProductUseCase,
      ...withOwnership((p, o) => new UpdateProductUseCase(p, o)),
    },
    {
      provide: ChangeProductStatusUseCase,
      ...withOwnership((p, o) => new ChangeProductStatusUseCase(p, o)),
    },
    {
      provide: DeleteProductUseCase,
      ...withOwnership((p, o) => new DeleteProductUseCase(p, o)),
    },
  ],
  exports: [ProductsFacade],
})
export class ProductsModule {}

import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import { ProductOwnership } from '../services/product-ownership';
import { InMemoryProductRepository } from '../testing/in-memory-product.repository';
import type { ProductWriteData } from '../types/product.type';
import { ChangeProductStatusUseCase } from './change-product-status.use-case';
import { CreateProductUseCase } from './create-product.use-case';
import { DeleteProductUseCase } from './delete-product.use-case';
import { GetProductUseCase } from './get-product.use-case';
import { UpdateProductUseCase } from './update-product.use-case';

const input = (
  overrides: Partial<ProductWriteData> = {},
): ProductWriteData => ({
  categoryId: 'cat-vegetables',
  title: '  Картофель  ',
  description: 'Свежий урожай',
  price: 150,
  unit: 'KG',
  availableQty: 2000,
  minOrderQty: 100,
  cityId: 'semey',
  deliveryAvailable: true,
  pickupAvailable: true,
  tags: ['Картошка', 'картошка', ' '],
  ...overrides,
});

describe('Product use cases', () => {
  let products: InMemoryProductRepository;
  let ownership: ProductOwnership;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    ownership = new ProductOwnership(products);
  });

  it('creates a product with normalized title and tags', async () => {
    const product = await new CreateProductUseCase(products).execute(
      'company-a',
      input(),
    );

    expect(product.title).toBe('Картофель');
    expect(product.tags).toEqual(['картошка']);
  });

  it('rejects minimum order above available stock', async () => {
    await expect(
      new CreateProductUseCase(products).execute(
        'company-a',
        input({ minOrderQty: 5000 }),
      ),
    ).rejects.toMatchObject({ code: 'MIN_ORDER_EXCEEDS_STOCK' });
  });

  it('rejects unknown category', async () => {
    await expect(
      new CreateProductUseCase(products).execute(
        'company-a',
        input({ categoryId: 'nope' }),
      ),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CATEGORY' });
  });

  it('forbids editing, hiding and deleting another supplier product', async () => {
    const product = await new CreateProductUseCase(products).execute(
      'company-a',
      input(),
    );

    await expect(
      new UpdateProductUseCase(products, ownership).execute(
        product.id,
        'company-b',
        input(),
      ),
    ).rejects.toBeInstanceOf(ForbiddenApplicationException);
    await expect(
      new ChangeProductStatusUseCase(products, ownership).execute(
        product.id,
        'company-b',
        'INACTIVE',
      ),
    ).rejects.toBeInstanceOf(ForbiddenApplicationException);
    await expect(
      new DeleteProductUseCase(products, ownership).execute(
        product.id,
        undefined,
      ),
    ).rejects.toBeInstanceOf(ForbiddenApplicationException);
  });

  it('hides inactive products from everyone except the owner', async () => {
    const product = await new CreateProductUseCase(products).execute(
      'company-a',
      input(),
    );
    await new ChangeProductStatusUseCase(products, ownership).execute(
      product.id,
      'company-a',
      'INACTIVE',
    );
    const getProduct = new GetProductUseCase(products);

    await expect(getProduct.execute(product.id)).rejects.toBeInstanceOf(
      NotFoundApplicationException,
    );
    await expect(
      getProduct.execute(product.id, 'company-a'),
    ).resolves.toMatchObject({
      isOwner: true,
    });
  });
});

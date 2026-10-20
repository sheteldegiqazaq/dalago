import { randomUUID } from 'node:crypto';
import type { ProductStatus } from '@generated/prisma/client';
import type { Paginated } from '@shared/pagination/pagination';
import type { ProductRepository } from '../repositories/product.repository';
import type {
  ProductDetailsRecord,
  ProductListRecord,
} from '../repositories/product.select';
import type {
  ProductSearchCriteria,
  ProductWriteData,
} from '../types/product.type';

const decimal = (value: number) =>
  ({ toNumber: () => value }) as unknown as ProductDetailsRecord['price'];

/** Упрощённый fake: хранит записи, поиск не реализует. */
export class InMemoryProductRepository implements ProductRepository {
  readonly items = new Map<string, ProductDetailsRecord>();
  readonly categories = new Set(['cat-vegetables']);
  readonly cities = new Set(['semey']);

  search(
    criteria: ProductSearchCriteria,
  ): Promise<Paginated<ProductListRecord>> {
    return Promise.resolve({
      items: [...this.items.values()],
      total: this.items.size,
      page: criteria.page,
      limit: criteria.limit,
    });
  }

  findById(id: string): Promise<ProductDetailsRecord | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  listBySupplier(companyId: string): Promise<ProductListRecord[]> {
    return Promise.resolve(
      [...this.items.values()].filter((p) => p.supplierCompanyId === companyId),
    );
  }

  categoryExists(categoryId: string): Promise<boolean> {
    return Promise.resolve(this.categories.has(categoryId));
  }

  cityExists(cityId: string): Promise<boolean> {
    return Promise.resolve(this.cities.has(cityId));
  }

  create(supplierCompanyId: string, data: ProductWriteData) {
    const now = new Date();
    const record = {
      id: randomUUID(),
      supplierCompanyId,
      title: data.title,
      titleKk: data.titleKk ?? null,
      description: data.description,
      descriptionKk: data.descriptionKk ?? null,
      tags: data.tags,
      price: decimal(data.price),
      currency: 'KZT',
      unit: data.unit,
      availableQty: decimal(data.availableQty),
      minOrderQty: decimal(data.minOrderQty),
      deliveryAvailable: data.deliveryAvailable,
      pickupAvailable: data.pickupAvailable,
      imageUrl: data.imageUrl ?? null,
      status: 'ACTIVE' as ProductStatus,
      isDemo: false,
      createdAt: now,
      updatedAt: now,
      searchText: '',
      city: { id: data.cityId, nameRu: data.cityId, nameKk: data.cityId },
      category: {
        id: data.categoryId,
        slug: 'vegetables',
        nameRu: 'Овощи',
        nameKk: 'Көкөністер',
        icon: 'carrot',
      },
      supplier: {
        id: supplierCompanyId,
        name: 'Supplier',
        type: 'FARM' as const,
        phone: '1',
        description: null,
        createdAt: now,
        isDemo: false,
        city: { id: 'semey', nameRu: 'Семей', nameKk: 'Семей' },
      },
    } satisfies ProductDetailsRecord;
    this.items.set(record.id, record);

    return Promise.resolve(record);
  }

  update(id: string, data: ProductWriteData) {
    const existing = this.items.get(id)!;
    const updated = {
      ...existing,
      title: data.title,
      price: decimal(data.price),
    };
    this.items.set(id, updated);

    return Promise.resolve(updated);
  }

  setStatus(id: string, status: ProductStatus) {
    const updated = { ...this.items.get(id)!, status };
    this.items.set(id, updated);

    return Promise.resolve(updated);
  }

  delete(id: string): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }
}

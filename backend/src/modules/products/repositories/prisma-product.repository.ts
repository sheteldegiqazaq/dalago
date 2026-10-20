import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { Prisma, ProductStatus } from '@generated/prisma/client';
import type { Paginated } from '@shared/pagination/pagination';
import { quantityConditions } from '../services/quantity-match';
import { buildSearchText, scoreMatch } from '../services/search-terms';
import type {
  ProductSearchCriteria,
  ProductWriteData,
} from '../types/product.type';
import type { ProductRepository } from './product.repository';
import {
  type ProductDetailsRecord,
  type ProductListRecord,
  productDetailsSelect,
  productListItemSelect,
} from './product.select';

// Для сортировки «по релевантности» скорим совпадения в памяти.
// Для пилотного объёма каталога этого достаточно; дальше — Postgres FTS.
const RELEVANCE_SCAN_LIMIT = 500;

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    criteria: ProductSearchCriteria,
  ): Promise<Paginated<ProductListRecord>> {
    const where = this.buildWhere(criteria);
    const skip = (criteria.page - 1) * criteria.limit;

    if (criteria.sort === 'relevance' && criteria.terms.length > 0) {
      const candidates = await this.prisma.product.findMany({
        where,
        select: productListItemSelect,
        orderBy: { updatedAt: 'desc' },
        take: RELEVANCE_SCAN_LIMIT,
      });
      const ranked = candidates
        .map((item) => ({ item, score: scoreMatch(criteria.terms, item) }))
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);

      return {
        items: ranked.slice(skip, skip + criteria.limit),
        total: ranked.length,
        page: criteria.page,
        limit: criteria.limit,
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      criteria.sort === 'price_asc'
        ? { price: 'asc' }
        : criteria.sort === 'price_desc'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: productListItemSelect,
        orderBy: [orderBy, { id: 'asc' }],
        skip,
        take: criteria.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page: criteria.page, limit: criteria.limit };
  }

  findById(id: string): Promise<ProductDetailsRecord | null> {
    return this.prisma.product.findUnique({
      where: { id },
      select: productDetailsSelect,
    });
  }

  listBySupplier(companyId: string): Promise<ProductListRecord[]> {
    return this.prisma.product.findMany({
      where: { supplierCompanyId: companyId },
      select: productListItemSelect,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async categoryExists(categoryId: string): Promise<boolean> {
    return (
      (await this.prisma.category.count({ where: { id: categoryId } })) > 0
    );
  }

  async cityExists(cityId: string): Promise<boolean> {
    return (await this.prisma.city.count({ where: { id: cityId } })) > 0;
  }

  async create(
    supplierCompanyId: string,
    data: ProductWriteData,
  ): Promise<ProductDetailsRecord> {
    return this.prisma.product.create({
      data: {
        ...data,
        supplierCompanyId,
        searchText: await this.searchTextFor(data),
      },
      select: productDetailsSelect,
    });
  }

  async update(
    id: string,
    data: ProductWriteData,
  ): Promise<ProductDetailsRecord> {
    return this.prisma.product.update({
      where: { id },
      data: { ...data, searchText: await this.searchTextFor(data) },
      select: productDetailsSelect,
    });
  }

  setStatus(id: string, status: ProductStatus): Promise<ProductDetailsRecord> {
    return this.prisma.product.update({
      where: { id },
      data: { status },
      select: productDetailsSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  private async searchTextFor(data: ProductWriteData): Promise<string> {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { nameRu: true, nameKk: true, slug: true },
    });

    return buildSearchText([
      data.title,
      data.titleKk,
      data.description,
      data.descriptionKk,
      ...data.tags,
      category?.nameRu,
      category?.nameKk,
      category?.slug,
    ]);
  }

  private buildWhere(
    criteria: ProductSearchCriteria,
  ): Prisma.ProductWhereInput {
    const and: Prisma.ProductWhereInput[] = [{ status: 'ACTIVE' }];

    if (criteria.terms.length > 0) {
      and.push({
        OR: criteria.terms.map((term) => ({
          searchText: { contains: term, mode: 'insensitive' as const },
        })),
      });
    }

    if (criteria.categorySlug) {
      and.push({ category: { slug: criteria.categorySlug } });
    }

    if (criteria.cityId) {
      and.push({ cityId: criteria.cityId });
    }

    if (criteria.regionId) {
      and.push({ city: { regionId: criteria.regionId } });
    }

    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      and.push({ price: { gte: criteria.minPrice, lte: criteria.maxPrice } });
    }

    if (criteria.quantity) {
      and.push({
        OR: quantityConditions(
          criteria.quantity.value,
          criteria.quantity.unit,
        ).map((condition) => ({
          unit: condition.unit,
          availableQty: { gte: condition.value },
          minOrderQty: { lte: condition.value },
        })),
      });
    }

    if (criteria.deliveryOnly) {
      and.push({ deliveryAvailable: true });
    }

    if (criteria.supplierCompanyId) {
      and.push({ supplierCompanyId: criteria.supplierCompanyId });
    }

    return { AND: and };
  }
}

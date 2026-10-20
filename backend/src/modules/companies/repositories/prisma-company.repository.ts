import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { Prisma } from '@generated/prisma/client';
import type { Paginated } from '@shared/pagination/pagination';
import type {
  CityStats,
  CompanyProfileData,
  CompanyRepository,
  SupplierCriteria,
} from './company.repository';
import { type SupplierRecord, supplierSelect } from './company.select';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listSuppliers(
    criteria: SupplierCriteria,
  ): Promise<Paginated<SupplierRecord>> {
    const where: Prisma.CompanyWhereInput = {
      owner: { role: 'SUPPLIER' },
      cityId: criteria.cityId,
      type: criteria.type,
      products: criteria.categorySlug
        ? {
            some: {
              status: 'ACTIVE',
              category: { slug: criteria.categorySlug },
            },
          }
        : undefined,
      OR: criteria.q
        ? [
            { name: { contains: criteria.q, mode: 'insensitive' } },
            { description: { contains: criteria.q, mode: 'insensitive' } },
            {
              products: {
                some: {
                  status: 'ACTIVE',
                  searchText: { contains: criteria.q.toLowerCase() },
                },
              },
            },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        select: supplierSelect,
        orderBy: [{ name: 'asc' }],
        skip: (criteria.page - 1) * criteria.limit,
        take: criteria.limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return { items, total, page: criteria.page, limit: criteria.limit };
  }

  findSupplier(id: string): Promise<SupplierRecord | null> {
    return this.prisma.company.findFirst({
      where: { id, owner: { role: 'SUPPLIER' } },
      select: supplierSelect,
    });
  }

  async statsByCity(): Promise<CityStats[]> {
    const [suppliers, products] = await Promise.all([
      this.prisma.company.groupBy({
        by: ['cityId'],
        where: { owner: { role: 'SUPPLIER' } },
        _count: { _all: true },
      }),
      this.prisma.product.groupBy({
        by: ['cityId'],
        where: { status: 'ACTIVE' },
        _count: { _all: true },
      }),
    ]);
    const stats = new Map<string, CityStats>();

    for (const row of suppliers) {
      stats.set(row.cityId, {
        cityId: row.cityId,
        suppliers: row._count._all,
        products: 0,
      });
    }

    for (const row of products) {
      const entry = stats.get(row.cityId) ?? {
        cityId: row.cityId,
        suppliers: 0,
        products: 0,
      };
      entry.products = row._count._all;
      stats.set(row.cityId, entry);
    }

    return [...stats.values()];
  }

  async cityExists(cityId: string): Promise<boolean> {
    return (await this.prisma.city.count({ where: { id: cityId } })) > 0;
  }

  updateProfile(id: string, data: CompanyProfileData): Promise<SupplierRecord> {
    return this.prisma.company.update({
      where: { id },
      data,
      select: supplierSelect,
    });
  }
}

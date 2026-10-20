import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { Category, City } from '@generated/prisma/client';
import type {
  ReferenceRepository,
  RegionWithCities,
} from './reference.repository';

@Injectable()
export class PrismaReferenceRepository implements ReferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  listRegions(): Promise<RegionWithCities[]> {
    return this.prisma.region.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { cities: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  listCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  listCities(): Promise<City[]> {
    return this.prisma.city.findMany({ orderBy: { sortOrder: 'asc' } });
  }
}

import type { Category, City, Region } from '@generated/prisma/client';

export type RegionWithCities = Region & { cities: City[] };

export interface ReferenceRepository {
  listRegions(): Promise<RegionWithCities[]>;
  listCategories(): Promise<Category[]>;
  listCities(): Promise<City[]>;
}

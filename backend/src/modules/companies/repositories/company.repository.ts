import type { CompanyType } from '@generated/prisma/client';
import type { Paginated } from '@shared/pagination/pagination';
import type { SupplierRecord } from './company.select';

export type SupplierCriteria = {
  q?: string;
  cityId?: string;
  categorySlug?: string;
  type?: CompanyType;
  page: number;
  limit: number;
};

export type CityStats = { cityId: string; suppliers: number; products: number };

export type CompanyProfileData = {
  name: string;
  description: string | null;
  cityId: string;
  address: string | null;
  phone: string;
};

export interface CompanyRepository {
  listSuppliers(criteria: SupplierCriteria): Promise<Paginated<SupplierRecord>>;
  findSupplier(id: string): Promise<SupplierRecord | null>;
  statsByCity(): Promise<CityStats[]>;
  cityExists(cityId: string): Promise<boolean>;
  updateProfile(id: string, data: CompanyProfileData): Promise<SupplierRecord>;
}

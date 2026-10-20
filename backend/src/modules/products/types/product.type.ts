import type { ProductStatus, Unit } from '@generated/prisma/client';

export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export type ProductSearchCriteria = {
  terms: string[];
  categorySlug?: string;
  cityId?: string;
  regionId?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Нужный покупателю объём: товар должен его покрывать. */
  quantity?: { value: number; unit?: Unit };
  deliveryOnly?: boolean;
  supplierCompanyId?: string;
  sort: ProductSort;
  page: number;
  limit: number;
};

export type ProductWriteData = {
  categoryId: string;
  title: string;
  titleKk?: string | null;
  description: string;
  descriptionKk?: string | null;
  price: number;
  unit: Unit;
  availableQty: number;
  minOrderQty: number;
  cityId: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  imageUrl?: string | null;
  tags: string[];
};

export type ProductStatusValue = ProductStatus;

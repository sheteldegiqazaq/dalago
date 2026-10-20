import type { RequestStatus, Unit } from '@generated/prisma/client';

export type RequestWriteData = {
  title: string;
  categoryId: string | null;
  description: string | null;
  quantity: number;
  unit: Unit;
  targetPrice: number | null;
  deliveryCityId: string;
  deliveryAddress: string | null;
  desiredDate: Date;
};

export type OfferWriteData = {
  quantity: number;
  pricePerUnit: number;
  deliveryCost: number | null;
  estimatedDeliveryDate: Date;
  terms: string | null;
  productId: string | null;
};

export type OpenRequestCriteria = {
  q?: string;
  categorySlug?: string;
  cityId?: string;
  page: number;
  limit: number;
};

export type RequestStatusFilter = RequestStatus | 'ACTIVE';

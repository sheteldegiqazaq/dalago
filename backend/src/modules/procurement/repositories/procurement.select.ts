import type { Prisma } from '@generated/prisma/client';

const place = { select: { id: true, nameRu: true, nameKk: true } } as const;

export const requestListSelect = {
  id: true,
  title: true,
  description: true,
  quantity: true,
  unit: true,
  targetPrice: true,
  currency: true,
  desiredDate: true,
  deliveryAddress: true,
  status: true,
  isSample: true,
  createdAt: true,
  updatedAt: true,
  buyerCompanyId: true,
  deliveryCity: place,
  category: {
    select: { id: true, slug: true, nameRu: true, nameKk: true, icon: true },
  },
  buyer: { select: { id: true, name: true, type: true, phone: true } },
  _count: { select: { offers: true } },
} satisfies Prisma.PurchaseRequestSelect;

export type RequestListRecord = Prisma.PurchaseRequestGetPayload<{
  select: typeof requestListSelect;
}>;

export const offerSelect = {
  id: true,
  requestId: true,
  supplierCompanyId: true,
  quantity: true,
  pricePerUnit: true,
  currency: true,
  deliveryCost: true,
  estimatedDeliveryDate: true,
  terms: true,
  status: true,
  isSample: true,
  createdAt: true,
  updatedAt: true,
  supplier: {
    select: { id: true, name: true, type: true, phone: true, city: place },
  },
  product: { select: { id: true, title: true, titleKk: true } },
} satisfies Prisma.OfferSelect;

export type OfferRecord = Prisma.OfferGetPayload<{
  select: typeof offerSelect;
}>;

export const requestDetailsSelect = {
  ...requestListSelect,
  offers: { select: offerSelect, orderBy: { pricePerUnit: 'asc' } },
} satisfies Prisma.PurchaseRequestSelect;

export type RequestDetailsRecord = Prisma.PurchaseRequestGetPayload<{
  select: typeof requestDetailsSelect;
}>;

export const supplierOfferSelect = {
  ...offerSelect,
  request: {
    select: {
      id: true,
      title: true,
      status: true,
      unit: true,
      quantity: true,
      desiredDate: true,
      deliveryCity: place,
      buyer: { select: { id: true, name: true, type: true } },
    },
  },
} satisfies Prisma.OfferSelect;

export type SupplierOfferRecord = Prisma.OfferGetPayload<{
  select: typeof supplierOfferSelect;
}>;

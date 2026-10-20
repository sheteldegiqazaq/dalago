import type { Prisma } from '@generated/prisma/client';

export const productListItemSelect = {
  id: true,
  title: true,
  titleKk: true,
  price: true,
  currency: true,
  unit: true,
  availableQty: true,
  minOrderQty: true,
  deliveryAvailable: true,
  pickupAvailable: true,
  imageUrl: true,
  status: true,
  isDemo: true,
  createdAt: true,
  updatedAt: true,
  searchText: true,
  city: { select: { id: true, nameRu: true, nameKk: true } },
  category: {
    select: { id: true, slug: true, nameRu: true, nameKk: true, icon: true },
  },
  supplier: { select: { id: true, name: true, type: true } },
} satisfies Prisma.ProductSelect;

export type ProductListRecord = Prisma.ProductGetPayload<{
  select: typeof productListItemSelect;
}>;

export const productDetailsSelect = {
  ...productListItemSelect,
  description: true,
  descriptionKk: true,
  tags: true,
  supplierCompanyId: true,
  supplier: {
    select: {
      id: true,
      name: true,
      type: true,
      phone: true,
      description: true,
      createdAt: true,
      isDemo: true,
      city: { select: { id: true, nameRu: true, nameKk: true } },
    },
  },
} satisfies Prisma.ProductSelect;

export type ProductDetailsRecord = Prisma.ProductGetPayload<{
  select: typeof productDetailsSelect;
}>;

import type { Prisma } from '@generated/prisma/client';

export const supplierSelect = {
  id: true,
  name: true,
  type: true,
  description: true,
  address: true,
  phone: true,
  isSample: true,
  createdAt: true,
  city: { select: { id: true, nameRu: true, nameKk: true, regionId: true } },
  products: {
    where: { status: 'ACTIVE' },
    select: {
      category: {
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameKk: true,
          icon: true,
        },
      },
    },
  },
} satisfies Prisma.CompanySelect;

export type SupplierRecord = Prisma.CompanyGetPayload<{
  select: typeof supplierSelect;
}>;

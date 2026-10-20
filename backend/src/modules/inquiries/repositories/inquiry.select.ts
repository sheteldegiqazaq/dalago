import type { Prisma } from '@generated/prisma/client';

const companyRef = { select: { id: true, name: true, type: true } } as const;

export const inquiryListSelect = {
  id: true,
  subject: true,
  fromCompanyId: true,
  toCompanyId: true,
  isDemo: true,
  createdAt: true,
  updatedAt: true,
  fromCompany: companyRef,
  toCompany: companyRef,
  product: { select: { id: true, title: true, titleKk: true } },
  request: { select: { id: true, title: true } },
  messages: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: {
      body: true,
      createdAt: true,
      author: { select: { company: { select: { id: true } } } },
    },
  },
  _count: { select: { messages: true } },
} satisfies Prisma.InquirySelect;

export type InquiryListRecord = Prisma.InquiryGetPayload<{
  select: typeof inquiryListSelect;
}>;

export const inquiryDetailsSelect = {
  ...inquiryListSelect,
  fromCompany: { select: { id: true, name: true, type: true, phone: true } },
  toCompany: { select: { id: true, name: true, type: true, phone: true } },
  messages: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: {
        select: { id: true, name: true, company: { select: { id: true } } },
      },
    },
  },
} satisfies Prisma.InquirySelect;

export type InquiryDetailsRecord = Prisma.InquiryGetPayload<{
  select: typeof inquiryDetailsSelect;
}>;

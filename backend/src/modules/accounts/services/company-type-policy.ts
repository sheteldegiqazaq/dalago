import type { CompanyType, UserRole } from '@generated/prisma/client';

export const SUPPLIER_COMPANY_TYPES: CompanyType[] = [
  'FARM',
  'PRODUCER',
  'PROCESSOR',
  'WHOLESALE',
];
export const BUYER_COMPANY_TYPES: CompanyType[] = [
  'SHOP',
  'CAFE',
  'RESTAURANT',
  'CANTEEN',
  'WHOLESALE',
];

/** Тип компании должен соответствовать роли: ферма не может быть «кафе». */
export function isCompanyTypeAllowed(
  role: UserRole,
  type: CompanyType,
): boolean {
  if (role === 'SUPPLIER') {
    return SUPPLIER_COMPANY_TYPES.includes(type);
  }

  if (role === 'BUYER') {
    return BUYER_COMPANY_TYPES.includes(type);
  }

  return false;
}

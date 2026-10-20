import type { UserRole } from '@generated/prisma/client';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  role?: UserRole;
  companyId?: string;
  [claim: string]: unknown;
};

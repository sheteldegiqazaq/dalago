import type { UserRole } from '@generated/prisma/client';

export type AccessTokenClaims = {
  sub: string;
  email: string;
  role: UserRole;
  companyId: string | null;
};

export interface TokenIssuer {
  issue(claims: AccessTokenClaims): Promise<string>;
}

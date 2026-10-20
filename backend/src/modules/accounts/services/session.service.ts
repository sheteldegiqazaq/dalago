import type { TokenIssuer } from '../ports/token-issuer';
import type { Account } from '../repositories/account.repository';

export class SessionService {
  constructor(private readonly tokens: TokenIssuer) {}

  async start(account: Account) {
    const accessToken = await this.tokens.issue({
      sub: account.id,
      email: account.email,
      role: account.role,
      companyId: account.company?.id ?? null,
    });

    return { accessToken, account };
  }
}

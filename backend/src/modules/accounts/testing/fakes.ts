import type { PasswordHasher } from '../ports/password-hasher';
import type { AccessTokenClaims, TokenIssuer } from '../ports/token-issuer';

export class FakePasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return Promise.resolve(`hashed:${password}`);
  }

  verify(password: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${password}`);
  }
}

export class FakeTokenIssuer implements TokenIssuer {
  lastClaims?: AccessTokenClaims;

  issue(claims: AccessTokenClaims): Promise<string> {
    this.lastClaims = claims;
    return Promise.resolve(`token-for-${claims.sub}`);
  }
}

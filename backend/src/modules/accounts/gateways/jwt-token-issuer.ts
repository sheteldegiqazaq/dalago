import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccessTokenClaims, TokenIssuer } from '../ports/token-issuer';

@Injectable()
export class JwtTokenIssuer implements TokenIssuer {
  constructor(private readonly jwt: JwtService) {}

  issue(claims: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync(claims);
  }
}

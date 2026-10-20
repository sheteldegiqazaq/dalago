import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from '@generated/prisma/client';
import type { AuthenticatedUser } from '../types/authenticated-user';

type RequestWithAuth = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};

type JwtUserPayload = {
  sub?: string;
  id?: string;
  email?: string;
  role?: UserRole;
  [claim: string]: unknown;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtUserPayload>(token);
      const id = payload.sub ?? payload.id;

      if (!id) {
        throw new UnauthorizedException('Authorization token is invalid');
      }

      request.user = {
        ...payload,
        id,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Authorization token is invalid');
    }
  }

  private extractBearerToken(header?: string): string | undefined {
    const [type, token] = header?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}

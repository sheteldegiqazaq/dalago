import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser } from '../types/authenticated-user';

type RequestWithAuth = {
  headers: { authorization?: string };
  user?: AuthenticatedUser;
};

/**
 * Пропускает анонимные запросы, но если передан валидный токен — кладёт
 * пользователя в request.user. Нужен для публичных страниц, где владелец
 * видит больше (например, свои неактивные объявления или предложения).
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return true;
    }

    try {
      const payload = await this.jwt.verifyAsync<
        AuthenticatedUser & { sub?: string }
      >(token);
      const id = payload.sub ?? payload.id;

      if (id) {
        request.user = { ...payload, id };
      }
    } catch {
      // невалидный токен на публичном маршруте = анонимный пользователь
    }

    return true;
  }
}

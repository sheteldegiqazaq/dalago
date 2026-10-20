import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '@shared/types/authenticated-user';

const WINDOW_MS = 60_000;

/**
 * Простое ограничение частоты для дорогих ИИ-запросов: N запросов в минуту
 * на пользователя (или IP для анонимов). Хранится в памяти процесса — для
 * одного инстанса MVP этого достаточно, без Redis.
 */
@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;

  constructor(config: ConfigService) {
    this.limit = config.getOrThrow<number>('ai.rateLimitPerMinute');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser; ip?: string }>();
    const key = request.user?.id ?? request.ip ?? 'anonymous';
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter(
      (t) => now - t < WINDOW_MS,
    );

    if (recent.length >= this.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Слишком много запросов к ИИ, попробуйте через минуту',
          code: 'AI_RATE_LIMITED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    this.hits.set(key, recent);

    return true;
  }
}

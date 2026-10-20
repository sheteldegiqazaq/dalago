import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { ForbiddenApplicationException } from '../exceptions/forbidden.exception';
import { NotFoundApplicationException } from '../exceptions/not-found.exception';
import { UnauthorizedApplicationException } from '../exceptions/unauthorized.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof NotFoundApplicationException) {
      this.reply(response, HttpStatus.NOT_FOUND, exception);
      return;
    }

    if (exception instanceof UnauthorizedApplicationException) {
      this.reply(response, HttpStatus.UNAUTHORIZED, exception);
      return;
    }

    if (exception instanceof ForbiddenApplicationException) {
      this.reply(response, HttpStatus.FORBIDDEN, exception);
      return;
    }

    if (exception instanceof DomainException) {
      this.reply(response, HttpStatus.BAD_REQUEST, exception);
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    // В лог пишем только имя и сообщение ошибки, без тела запроса и персональных данных.
    const error = exception instanceof Error ? exception : undefined;
    this.logger.error(
      `${error?.name ?? 'UnknownError'}: ${error?.message ?? String(exception)}`,
      error?.stack,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Ошибка сервера',
      code: 'INTERNAL_ERROR',
    });
  }

  private reply(
    response: Response,
    status: HttpStatus,
    exception: Error & { code: string },
  ): void {
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      code: exception.code,
    });
  }
}

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { getCorsConfig } from './cors/get-cors-config';
import { HttpExceptionFilter } from '../shared/filters/http-exception.filter';

export function setupApp(app: NestExpressApplication): void {
  app.set('trust proxy', true);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(ConfigService);
  app.enableCors(getCorsConfig(config));
  app.setGlobalPrefix(config.getOrThrow<string>('app.apiPrefix'));
}

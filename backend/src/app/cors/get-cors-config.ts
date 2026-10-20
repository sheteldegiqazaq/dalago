import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { ConfigService } from '@nestjs/config';

export function getCorsConfig(config: ConfigService): CorsOptions {
  const originsString = config.getOrThrow<string>('cors.allowedOrigins');
  const origins = originsString.split(',').map((origin) => origin.trim());

  return {
    origin: origins,
    credentials: true,
    exposedHeaders: config.getOrThrow<string[]>('cors.exposedHeaders'),
  };
}

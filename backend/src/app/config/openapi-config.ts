import { registerAs } from '@nestjs/config';

export const openapiConfig = registerAs('openapi', () => ({
  title: process.env.OPENAPI_TITLE ?? 'Документация DalaGo API',
  version: process.env.OPENAPI_VERSION ?? '0.1',
  outputPath: process.env.OPENAPI_OUTPUT_PATH ?? './uploads/openapi',
}));

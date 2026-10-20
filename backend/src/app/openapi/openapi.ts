import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { RedocModule, type RedocOptions } from 'nestjs-redoc';

export async function setupOpenApi(app: INestApplication): Promise<void> {
  const config = app.get(ConfigService);
  const apiPrefix = config.getOrThrow<string>('app.apiPrefix');
  const title = config.getOrThrow<string>('openapi.title');

  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription('Документация HTTP API backend-приложения.')
    .setVersion(config.getOrThrow<string>('openapi.version'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token в формате Bearer.',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
  });
  const outputPath = config.getOrThrow<string>('openapi.outputPath');

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  writeFileSync(
    `${outputPath}/openapi-spec.json`,
    JSON.stringify(document, null, 2),
  );

  const redocOptions: RedocOptions = {
    title,
    sortPropsAlphabetically: true,
    hideDownloadButton: true,
    hideHostname: true,
  };

  await RedocModule.setup(`${apiPrefix}/docs`, app, document, redocOptions);
  SwaggerModule.setup(`${apiPrefix}/docs-json`, app, document);
}

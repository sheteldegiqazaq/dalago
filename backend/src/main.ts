import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { runSeedOnBoot } from './app/database/seeding/run-seed-on-boot';
import { setupOpenApi } from './app/openapi/openapi';
import { setupApp } from './app/setup-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  await setupOpenApi(app);
  await runSeedOnBoot(app);

  const config = app.get(ConfigService);
  await app.listen(config.getOrThrow<number>('app.port'));
}
void bootstrap();

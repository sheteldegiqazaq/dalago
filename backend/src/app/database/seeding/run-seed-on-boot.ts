import { Logger, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseSeederService } from './database-seeder.service';

const logger = new Logger('DatabaseSeed');

export async function runSeedOnBoot(app: INestApplication): Promise<void> {
  const config = app.get(ConfigService);
  const seedOnBoot = config.getOrThrow<boolean>('seed.onBoot');

  if (!seedOnBoot) {
    return;
  }

  const nodeEnv = config.getOrThrow<string>('app.nodeEnv');
  const allowProductionSeed = config.getOrThrow<boolean>(
    'seed.allowProduction',
  );

  if (nodeEnv === 'production' && !allowProductionSeed) {
    logger.warn(
      'Seed on boot skipped in production. Set SEED_ALLOW_PRODUCTION=true to allow it explicitly.',
    );
    return;
  }

  await app.get(DatabaseSeederService).seed();
}

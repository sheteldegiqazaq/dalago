import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../src/app/database/prisma.service';
import {
  SAMPLE_PASSWORD,
  seedDatabase,
} from '../src/app/database/seeding/seed-database';

const logger = new Logger('DatabaseSeed');

async function bootstrap() {
  const prisma = new PrismaService();

  try {
    const result = await seedDatabase(prisma, {
      adminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
      adminName: process.env.SEED_ADMIN_NAME ?? 'Admin',
    });

    logger.log(
      `Seed completed: ${JSON.stringify(result.samples)}. Sample account password: ${SAMPLE_PASSWORD}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void bootstrap();

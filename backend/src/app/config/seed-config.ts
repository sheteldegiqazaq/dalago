import { registerAs } from '@nestjs/config';

export const seedConfig = registerAs('seed', () => ({
  onBoot: process.env.SEED_ON_BOOT === 'true',
  allowProduction: process.env.SEED_ALLOW_PRODUCTION === 'true',
  adminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
  adminName: process.env.SEED_ADMIN_NAME ?? 'Admin',
}));

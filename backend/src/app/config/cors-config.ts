import { registerAs } from '@nestjs/config';

export const corsConfig = registerAs('cors', () => ({
  allowedOrigins: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
  exposedHeaders: ['Authorization', 'set-auth-token'],
}));

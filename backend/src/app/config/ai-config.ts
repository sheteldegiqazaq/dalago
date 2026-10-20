import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  apiKey: process.env.ANTHROPIC_API_KEY?.trim() || undefined,
  model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5',
  rateLimitPerMinute: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 15),
}));

import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type { AiAssistant, AiMode } from '../ports/ai-assistant';

export type AiNotice = 'AI_NOT_CONFIGURED' | 'AI_UNAVAILABLE_FALLBACK' | null;

/**
 * Выполняет операцию через Claude, если ключ настроен, иначе — через правила.
 * При ошибке Claude честно переключается на правила и сообщает об этом (mode + notice).
 */
export class AiRunner {
  private readonly logger = new Logger(AiRunner.name);

  constructor(
    private readonly live: AiAssistant | null,
    private readonly fallback: AiAssistant,
  ) {}

  get configuredMode(): AiMode {
    return this.live ? this.live.mode : this.fallback.mode;
  }

  async run<T>(
    operation: (assistant: AiAssistant) => Promise<T>,
  ): Promise<{ result: T; mode: AiMode; notice: AiNotice }> {
    if (!this.live) {
      return {
        result: await operation(this.fallback),
        mode: this.fallback.mode,
        notice: 'AI_NOT_CONFIGURED',
      };
    }

    try {
      return {
        result: await operation(this.live),
        mode: this.live.mode,
        notice: null,
      };
    } catch (error) {
      const reason =
        error instanceof Anthropic.APIError
          ? `API ${error.status ?? 'connection'} error`
          : error instanceof Error
            ? error.message
            : 'unknown error';
      this.logger.warn(
        `Claude unavailable, using rule-based fallback: ${reason}`,
      );

      return {
        result: await operation(this.fallback),
        mode: this.fallback.mode,
        notice: 'AI_UNAVAILABLE_FALLBACK',
      };
    }
  }
}

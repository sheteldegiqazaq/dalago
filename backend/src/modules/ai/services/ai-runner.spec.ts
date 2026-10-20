import type { AiAssistant } from '../ports/ai-assistant';
import { RuleBasedAiAssistant } from '../gateways/rule-based-ai-assistant';
import { AiRunner } from './ai-runner';

class FailingAssistant implements AiAssistant {
  readonly mode = 'claude' as const;
  draftListing(): never {
    throw new Error('network down');
  }
  parseSearch(): never {
    throw new Error('network down');
  }
}

describe('AiRunner', () => {
  const op = (assistant: AiAssistant) => Promise.resolve(assistant.mode);

  it('uses rules and reports it when no API key is configured', async () => {
    const runner = new AiRunner(null, new RuleBasedAiAssistant());

    await expect(runner.run(op)).resolves.toEqual({
      result: 'rules',
      mode: 'rules',
      notice: 'AI_NOT_CONFIGURED',
    });
  });

  it('falls back to rules when Claude fails and never claims Claude answered', async () => {
    const runner = new AiRunner(
      new FailingAssistant(),
      new RuleBasedAiAssistant(),
    );
    const outcome = await runner.run((assistant) =>
      assistant.draftListing('2 т картошки', {
        categories: [],
        cities: [],
        today: '2026-10-20',
      }),
    );

    expect(outcome.mode).toBe('rules');
    expect(outcome.notice).toBe('AI_UNAVAILABLE_FALLBACK');
    expect(outcome.result.categorySlug).toBe('vegetables');
  });
});

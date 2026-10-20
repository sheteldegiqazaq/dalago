import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsFacade, ProductsModule } from '@modules/products';
import { ReferenceFacade, ReferenceModule } from '@modules/reference';
import { FALLBACK_AI_ASSISTANT, LIVE_AI_ASSISTANT } from './ai.tokens';
import { AiController } from './controllers/ai.controller';
import { AnthropicAiAssistant } from './gateways/anthropic-ai-assistant';
import { RuleBasedAiAssistant } from './gateways/rule-based-ai-assistant';
import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';
import type { AiAssistant } from './ports/ai-assistant';
import { AiRunner } from './services/ai-runner';
import { CatalogContextProvider } from './services/catalog-context';
import { AiSearchUseCase } from './use-cases/ai-search.use-case';
import { DraftListingUseCase } from './use-cases/draft-listing.use-case';

@Module({
  imports: [ProductsModule, ReferenceModule],
  controllers: [AiController],
  providers: [
    AiRateLimitGuard,
    {
      // Без ANTHROPIC_API_KEY бэкенд не падает: live-ассистента просто нет.
      provide: LIVE_AI_ASSISTANT,
      useFactory: (config: ConfigService): AiAssistant | null => {
        const apiKey = config.get<string>('ai.apiKey');

        return apiKey
          ? new AnthropicAiAssistant(
              apiKey,
              config.getOrThrow<string>('ai.model'),
            )
          : null;
      },
      inject: [ConfigService],
    },
    { provide: FALLBACK_AI_ASSISTANT, useClass: RuleBasedAiAssistant },
    {
      provide: AiRunner,
      useFactory: (live: AiAssistant | null, fallback: AiAssistant) =>
        new AiRunner(live, fallback),
      inject: [LIVE_AI_ASSISTANT, FALLBACK_AI_ASSISTANT],
    },
    {
      provide: CatalogContextProvider,
      useFactory: (reference: ReferenceFacade) =>
        new CatalogContextProvider(reference),
      inject: [ReferenceFacade],
    },
    {
      provide: DraftListingUseCase,
      useFactory: (runner: AiRunner, catalog: CatalogContextProvider) =>
        new DraftListingUseCase(runner, catalog),
      inject: [AiRunner, CatalogContextProvider],
    },
    {
      provide: AiSearchUseCase,
      useFactory: (
        runner: AiRunner,
        catalog: CatalogContextProvider,
        products: ProductsFacade,
      ) => new AiSearchUseCase(runner, catalog, products),
      inject: [AiRunner, CatalogContextProvider, ProductsFacade],
    },
  ],
})
export class AiModule {}

import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type {
  AiAssistant,
  CatalogContext,
  ListingDraft,
  SearchIntent,
} from '../ports/ai-assistant';
import {
  LISTING_JSON_SCHEMA,
  ListingDraftPayload,
  SEARCH_JSON_SCHEMA,
  SearchIntentPayload,
} from './ai-payload.schema';

const LISTING_SYSTEM = `Ты помогаешь фермерам и производителям Казахстана оформить оптовое объявление на B2B-площадке.
Пользователь пишет свободным текстом на русском или казахском. Верни поля объявления.

Правила:
- Используй только факты из текста. Если цена, объём, единица, город или способ доставки не названы — верни null. Ничего не выдумывай: ни цену, ни сорт, ни сертификаты, ни характеристики.
- title — короткое понятное название товара на русском (до 60 символов), titleKk — то же на казахском.
- description — аккуратное деловое описание на русском только из сказанного пользователем; descriptionKk — его перевод на казахский.
- categorySlug — только один из списка категорий ниже или null.
- cityId — только один из id населённых пунктов ниже или null.
- unit: KG, T (тонна), L, PCS (штука), PACK. «кило» = KG.
- price — цена за одну единицу unit в тенге.
- tags — 2–5 коротких поисковых слов на русском/казахском (синонимы товара), без выдуманных свойств.`;

const SEARCH_SYSTEM = `Ты превращаешь запрос покупателя (магазин, кафе, ресторан) на русском, казахском или английском в фильтры поиска по каталогу B2B-площадки области Абай.

Правила:
- keywords — 1–4 основы слов на русском и казахском для поиска товара (например «картоф», «картоп», «говяд», «сиыр»). Без городов и общих слов.
- categorySlug — один из списка категорий или null.
- cityId — id населённого пункта из списка, если покупатель хочет поставщика именно там. Если нужен товар «с доставкой в город», верни cityId null, regionId "abai" и deliveryRequired true.
- regionId — "abai", если упомянута область Абай или город из списка при доставке; иначе null.
- maxPrice/minPrice — цена за единицу в тенге, только если названа.
- quantity/unit — нужный объём, если назван.
- neededBy — дата в формате YYYY-MM-DD, если назван срок («до пятницы», «завтра»); считай от сегодняшней даты.
- Ничего не придумывай: неизвестное = null.`;

/** Адаптер к Claude API. Ключ живёт только на бэкенде. В запрос уходит только текст пользователя и справочники. */
export class AnthropicAiAssistant implements AiAssistant {
  readonly mode = 'claude' as const;
  private readonly logger = new Logger(AnthropicAiAssistant.name);
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new Anthropic({ apiKey, timeout: 20_000, maxRetries: 1 });
  }

  async draftListing(
    text: string,
    context: CatalogContext,
  ): Promise<ListingDraft> {
    const payload = await this.ask(
      LISTING_SYSTEM,
      text,
      context,
      LISTING_JSON_SCHEMA,
    );

    return this.validate(ListingDraftPayload, payload);
  }

  async parseSearch(
    text: string,
    context: CatalogContext,
  ): Promise<SearchIntent> {
    const payload = await this.ask(
      SEARCH_SYSTEM,
      text,
      context,
      SEARCH_JSON_SCHEMA,
    );
    const intent = this.validate(SearchIntentPayload, payload);

    return { ...intent, neededBy: intent.neededBy ?? null };
  }

  private async ask(
    system: string,
    text: string,
    context: CatalogContext,
    schema: Record<string, unknown>,
  ): Promise<unknown> {
    const catalog = [
      `Сегодня: ${context.today}`,
      `Категории (slug — ru / kk): ${context.categories.map((c) => `${c.slug} — ${c.nameRu} / ${c.nameKk}`).join('; ')}`,
      `Населённые пункты (id — ru / kk): ${context.cities.map((c) => `${c.id} — ${c.nameRu} / ${c.nameKk}`).join('; ')}`,
    ].join('\n');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4000,
      system: `${system}\n\n${catalog}`,
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: text }],
    });

    if (
      response.stop_reason === 'refusal' ||
      response.stop_reason === 'max_tokens'
    ) {
      throw new Error(`Claude stopped: ${response.stop_reason}`);
    }

    const block = response.content.find((item) => item.type === 'text');

    if (!block || block.type !== 'text') {
      throw new Error('Claude returned no text block');
    }

    this.logger.log(
      `Claude ${this.model}: in=${response.usage.input_tokens} out=${response.usage.output_tokens}`,
    );

    return JSON.parse(block.text) as unknown;
  }

  private validate<T extends object>(cls: new () => T, payload: unknown): T {
    const instance = plainToInstance(cls, payload);
    const errors = validateSync(instance, { whitelist: true });

    if (errors.length > 0) {
      throw new Error(
        `Invalid AI payload: ${errors.map((e) => e.property).join(', ')}`,
      );
    }

    return instance;
  }
}

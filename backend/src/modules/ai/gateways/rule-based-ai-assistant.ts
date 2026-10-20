import type {
  AiAssistant,
  CatalogContext,
  ListingDraft,
  SearchIntent,
} from '../ports/ai-assistant';
import { parseListingText, parseSearchQuery } from '../services/rule-parser';

/** Резервный режим без внешнего API: словари и регулярные выражения (ru/kk/en). */
export class RuleBasedAiAssistant implements AiAssistant {
  readonly mode = 'rules' as const;

  draftListing(text: string): Promise<ListingDraft> {
    return Promise.resolve(parseListingText(text));
  }

  parseSearch(text: string, context: CatalogContext): Promise<SearchIntent> {
    return Promise.resolve(
      parseSearchQuery(text, new Date(`${context.today}T12:00:00Z`)),
    );
  }
}

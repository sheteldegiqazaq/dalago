import type { AiRunner } from '../services/ai-runner';
import type { CatalogContextProvider } from '../services/catalog-context';
import {
  missingListingFields,
  sanitizeListing,
} from '../services/draft-sanitizer';

export class DraftListingUseCase {
  constructor(
    private readonly runner: AiRunner,
    private readonly catalog: CatalogContextProvider,
  ) {}

  async execute(text: string) {
    const context = await this.catalog.get();
    const { result, mode, notice } = await this.runner.run((assistant) =>
      assistant.draftListing(text, context),
    );
    const draft = sanitizeListing(result, text, context);

    return { mode, notice, draft, missingFields: missingListingFields(draft) };
  }
}

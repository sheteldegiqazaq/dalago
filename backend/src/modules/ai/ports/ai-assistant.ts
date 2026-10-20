import type { Unit } from '@generated/prisma/client';

export type AiMode = 'claude' | 'rules';

/** Что модель знает о каталоге: только slug-и и id из нашей базы. */
export type CatalogContext = {
  categories: Array<{ slug: string; nameRu: string; nameKk: string }>;
  cities: Array<{ id: string; nameRu: string; nameKk: string }>;
  today: string;
};

export type ListingDraft = {
  title: string;
  titleKk: string | null;
  description: string;
  descriptionKk: string | null;
  categorySlug: string | null;
  quantity: number | null;
  unit: Unit | null;
  price: number | null;
  cityId: string | null;
  deliveryAvailable: boolean | null;
  pickupAvailable: boolean | null;
  tags: string[];
};

export type SearchIntent = {
  keywords: string[];
  categorySlug: string | null;
  cityId: string | null;
  regionId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  quantity: number | null;
  unit: Unit | null;
  deliveryRequired: boolean;
  /** Срок, если покупатель его назвал (YYYY-MM-DD) — для черновика заявки. */
  neededBy: string | null;
};

export interface AiAssistant {
  readonly mode: AiMode;
  draftListing(text: string, context: CatalogContext): Promise<ListingDraft>;
  parseSearch(text: string, context: CatalogContext): Promise<SearchIntent>;
}

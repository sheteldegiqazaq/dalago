import type { ListingDraft } from '../ports/ai-assistant';
import { missingListingFields, sanitizeListing } from './draft-sanitizer';

const context = {
  categories: [{ slug: 'vegetables', nameRu: 'Овощи', nameKk: 'Көкөністер' }],
  cities: [{ id: 'semey', nameRu: 'Семей', nameKk: 'Семей' }],
  today: '2026-10-20',
};

const draft: ListingDraft = {
  title: 'Картофель',
  titleKk: null,
  description: 'x',
  descriptionKk: null,
  categorySlug: 'potatoes',
  quantity: 2,
  unit: 'T',
  price: 150,
  cityId: 'almaty',
  deliveryAvailable: null,
  pickupAvailable: null,
  tags: ['Картошка', 'картошка'],
};

describe('sanitizeListing', () => {
  it('drops categories and cities that are not in our reference data', () => {
    const result = sanitizeListing(
      draft,
      'продаю 2 т картошки по 150',
      context,
    );

    expect(result.categorySlug).toBeNull();
    expect(result.cityId).toBeNull();
    expect(result.tags).toEqual(['картошка']);
  });

  it('removes numbers when the text contains no digits at all', () => {
    const result = sanitizeListing(draft, 'продаю картошку', context);

    expect(result.price).toBeNull();
    expect(result.quantity).toBeNull();
    expect(missingListingFields(result)).toEqual([
      'categorySlug',
      'price',
      'quantity',
      'cityId',
    ]);
  });
});

import {
  findDeadline,
  findMaxPrice,
  findQuantity,
  parseListingText,
  parseSearchQuery,
} from './rule-parser';

const MONDAY = new Date('2026-10-19T09:00:00Z');

describe('rule-based search parser', () => {
  it('parses a Russian buyer query (prompt example)', () => {
    const intent = parseSearchQuery(
      'Найди картофель до 150 тенге за килограмм с доставкой в Семей.',
      MONDAY,
    );

    expect(intent).toMatchObject({
      categorySlug: 'vegetables',
      maxPrice: 150,
      deliveryRequired: true,
      cityId: null,
      regionId: 'abai',
      quantity: null,
    });
    expect(intent.keywords).toContain('картоф');
  });

  it('parses a Kazakh buyer query with case endings (prompt example)', () => {
    const intent = parseSearchQuery(
      'Семейге 500 кг картоп жеткізетін өндірушілерді тап.',
      MONDAY,
    );

    expect(intent).toMatchObject({
      categorySlug: 'vegetables',
      quantity: 500,
      unit: 'KG',
      deliveryRequired: true,
      regionId: 'abai',
    });
  });

  it('parses an English region query (prompt example)', () => {
    const intent = parseSearchQuery(
      'Find grain suppliers in Abai Region.',
      MONDAY,
    );

    expect(intent).toMatchObject({ categorySlug: 'grain', regionId: 'abai' });
  });

  it('parses the cafe beef example with city and deadline', () => {
    const intent = parseSearchQuery(
      'нужно 50 кг свежей говядины для кафе в Семее до пятницы',
      MONDAY,
    );

    expect(intent).toMatchObject({
      categorySlug: 'meat',
      cityId: 'semey',
      quantity: 50,
      unit: 'KG',
      maxPrice: null,
      neededBy: '2026-10-23',
    });
    expect(intent.keywords).toContain('говяд');
  });

  it('does not treat a quantity limit as a price', () => {
    expect(findMaxPrice('до 200 кг мёда')).toBeNull();
    expect(findMaxPrice('мёд 3000 теңгеге дейін')).toBe(3000);
  });

  it('does not confuse «тг» with tonnes', () => {
    expect(findQuantity('по 150 тг за кг')).toBeNull();
    expect(findQuantity('2 тонны ячменя')).toEqual({ value: 2, unit: 'T' });
    expect(findQuantity('1,5 т пшеницы')).toEqual({ value: 1.5, unit: 'T' });
    expect(findQuantity('200 литров молока')).toEqual({
      value: 200,
      unit: 'L',
    });
  });

  it('returns no category when nothing is recognised', () => {
    const intent = parseSearchQuery('что-нибудь вкусное', MONDAY);

    expect(intent.categorySlug).toBeNull();
    expect(intent.keywords).toEqual([]);
  });

  it('resolves tomorrow and weekdays', () => {
    expect(findDeadline('нужно завтра', MONDAY)).toBe('2026-10-20');
    expect(findDeadline('жұмаға дейін', MONDAY)).toBe('2026-10-23');
    expect(findDeadline('без срока', MONDAY)).toBeNull();
  });
});

describe('rule-based listing parser', () => {
  it('extracts fields from the CLAUDE.md example', () => {
    const draft = parseListingText(
      'продаю 2 тонны картошки, 150 тг за кило, Семей, доставка своя',
    );

    expect(draft).toMatchObject({
      title: 'Картофель',
      titleKk: 'Картоп',
      categorySlug: 'vegetables',
      quantity: 2,
      unit: 'T',
      price: 150,
      cityId: 'semey',
      deliveryAvailable: true,
    });
  });

  it('never invents a price that was not given (prompt example)', () => {
    const draft = parseListingText(
      'Продам 2 тонны ячменя, урожай этого года, отгрузка на следующей неделе.',
    );

    expect(draft).toMatchObject({
      title: 'Ячмень',
      categorySlug: 'grain',
      quantity: 2,
      unit: 'T',
      price: null,
      cityId: null,
      deliveryAvailable: null,
    });
    expect(draft.description).toContain('урожай этого года');
  });

  it('handles Kazakh listings', () => {
    const draft = parseListingText(
      'Үржардан 40 литр қымыз сатамын, бағасы 1200 теңге',
    );

    expect(draft).toMatchObject({
      categorySlug: 'dairy',
      titleKk: 'Қымыз',
      quantity: 40,
      unit: 'L',
      price: 1200,
      cityId: 'urzhar',
    });
  });
});

import { buildSearchText, scoreMatch, toSearchTerms } from './search-terms';

describe('toSearchTerms', () => {
  it('stems long words and drops short ones', () => {
    expect(toSearchTerms('Свежая говядины в Семей')).toEqual([
      'свежа',
      'говяди',
      'семей',
    ]);
  });

  it('keeps Kazakh letters', () => {
    expect(toSearchTerms('картоп сүт')).toEqual(['карто', 'сүт']);
  });

  it('returns empty list for empty query', () => {
    expect(toSearchTerms('  ')).toEqual([]);
    expect(toSearchTerms(undefined)).toEqual([]);
  });
});

describe('scoreMatch', () => {
  const item = {
    title: 'Картофель',
    titleKk: 'Картоп',
    searchText: buildSearchText(['Картофель', 'Картоп', 'овощи', 'картошка']),
  };

  it('ranks title matches above description matches', () => {
    expect(scoreMatch(['картоп'], item)).toBe(3);
    expect(scoreMatch(['овощ'], item)).toBe(1);
    expect(scoreMatch(['мёд'], item)).toBe(0);
  });
});

import { quantityConditions } from './quantity-match';

describe('quantityConditions', () => {
  it('converts kilograms to tonnes for tonne listings', () => {
    expect(quantityConditions(500, 'KG')).toEqual([
      { unit: 'KG', value: 500 },
      { unit: 'T', value: 0.5 },
    ]);
  });

  it('converts tonnes to kilograms', () => {
    expect(quantityConditions(2, 'T')).toEqual([
      { unit: 'T', value: 2 },
      { unit: 'KG', value: 2000 },
    ]);
  });

  it('keeps the unit for litres and pieces', () => {
    expect(quantityConditions(30, 'L')).toEqual([{ unit: 'L', value: 30 }]);
  });

  it('compares raw value when unit is unknown', () => {
    expect(quantityConditions(10)).toEqual([{ value: 10 }]);
  });
});

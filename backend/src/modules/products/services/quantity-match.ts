import type { Unit } from '@generated/prisma/client';

export type QuantityCondition = { unit?: Unit; value: number };

/**
 * Покупатель просит «500 кг», а поставщик продаёт в тоннах.
 * Возвращаем условия в единицах каждого совместимого товара.
 */
export function quantityConditions(
  value: number,
  unit?: Unit,
): QuantityCondition[] {
  if (!unit) {
    return [{ value }];
  }

  if (unit === 'KG') {
    return [
      { unit: 'KG', value },
      { unit: 'T', value: value / 1000 },
    ];
  }

  if (unit === 'T') {
    return [
      { unit: 'T', value },
      { unit: 'KG', value: value * 1000 },
    ];
  }

  return [{ unit, value }];
}

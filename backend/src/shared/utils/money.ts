type DecimalLike = { toNumber(): number };

/** Prisma Decimal → number для HTTP-ответа (тенге, 2 знака). */
export function toNumber(value: DecimalLike): number;
export function toNumber(value: DecimalLike | null): number | null;
export function toNumber(value: DecimalLike | null): number | null {
  return value === null ? null : value.toNumber();
}

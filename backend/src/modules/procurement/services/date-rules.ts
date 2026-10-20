import { DomainException } from '@shared/exceptions/domain.exception';

/** Дата в формате YYYY-MM-DD не должна быть в прошлом (сравниваем по дням, UTC). */
export function parseFutureDate(value: string, code: string): Date {
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new DomainException('Некорректная дата', code);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (date < today) {
    throw new DomainException('Дата не может быть в прошлом', code);
  }

  return date;
}

import { parseFutureDate } from './date-rules';

describe('parseFutureDate', () => {
  it('accepts today and future dates', () => {
    const today = new Date().toISOString().slice(0, 10);

    expect(parseFutureDate(today, 'X').toISOString().slice(0, 10)).toBe(today);
    expect(parseFutureDate('2999-01-01', 'X').getUTCFullYear()).toBe(2999);
  });

  it('rejects past and invalid dates with the given code', () => {
    expect(() => parseFutureDate('2000-01-01', 'PAST')).toThrow(
      expect.objectContaining({ code: 'PAST' }) as Error,
    );
    expect(() => parseFutureDate('not-a-date', 'BAD')).toThrow(
      expect.objectContaining({ code: 'BAD' }) as Error,
    );
  });
});

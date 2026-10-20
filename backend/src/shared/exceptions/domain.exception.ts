/**
 * Нарушение бизнес-правила (HTTP 400).
 * `code` — стабильный машинный код, по нему фронтенд показывает перевод (ru/kk).
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code = 'DOMAIN_ERROR',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

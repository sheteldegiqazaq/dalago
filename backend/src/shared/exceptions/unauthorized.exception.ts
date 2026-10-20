/** Неверные учётные данные (HTTP 401). */
export class UnauthorizedApplicationException extends Error {
  constructor(
    message: string,
    public readonly code = 'UNAUTHORIZED',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

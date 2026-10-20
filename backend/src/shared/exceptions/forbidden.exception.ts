/** Пользователь аутентифицирован, но не владеет ресурсом (HTTP 403). */
export class ForbiddenApplicationException extends Error {
  constructor(
    message: string,
    public readonly code = 'FORBIDDEN',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

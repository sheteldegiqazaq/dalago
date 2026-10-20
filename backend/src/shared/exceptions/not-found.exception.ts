export class NotFoundApplicationException extends Error {
  constructor(
    message: string,
    public readonly code = 'NOT_FOUND',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

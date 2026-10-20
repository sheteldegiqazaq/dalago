import { DomainException } from '@shared/exceptions/domain.exception';

export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainException('Invalid email address');
    }

    return new Email(normalized);
  }
}

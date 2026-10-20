import { DomainException } from '@shared/exceptions/domain.exception';
import type { UserRepository } from '../repositories/user.repository';
import { Email } from '../value-objects/email.vo';

export class UserUniquenessService {
  constructor(private readonly users: UserRepository) {}

  async ensureEmailIsAvailable(email: Email): Promise<void> {
    if (await this.users.exists(email)) {
      throw new DomainException('User email already exists');
    }
  }
}

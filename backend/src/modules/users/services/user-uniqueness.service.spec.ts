import { DomainException } from '@shared/exceptions/domain.exception';
import { InMemoryUserRepository } from '../testing/in-memory-user.repository';
import { UserBuilder } from '../testing/user.builder';
import { Email } from '../value-objects/email.vo';
import { UserUniquenessService } from './user-uniqueness.service';

describe('UserUniquenessService', () => {
  let users: InMemoryUserRepository;
  let service: UserUniquenessService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    service = new UserUniquenessService(users);
  });

  it('should pass when email is available', async () => {
    await expect(
      service.ensureEmailIsAvailable(Email.create('new@example.com')),
    ).resolves.toBeUndefined();
  });

  it('should throw when email already exists', async () => {
    users.insert(UserBuilder.user().withEmail('existing@example.com').build());

    await expect(
      service.ensureEmailIsAvailable(Email.create('existing@example.com')),
    ).rejects.toThrow(DomainException);
  });
});

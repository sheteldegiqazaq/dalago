import { DomainException } from '@shared/exceptions/domain.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import { UserUniquenessService } from '../services/user-uniqueness.service';
import { InMemoryUserRepository } from '../testing/in-memory-user.repository';
import { UserBuilder } from '../testing/user.builder';
import { UpdateUserUseCase } from './update-user.use-case';

describe('UpdateUserUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new UpdateUserUseCase(users, new UserUniquenessService(users));
  });

  it('updates the user name', async () => {
    const user = new UserBuilder().build();
    users.insert(user);

    const result = await useCase.execute({ id: user.id, name: '  Aigerim  ' });

    expect(result.name).toBe('Aigerim');
    expect(result.email).toBe(user.email);
  });

  it('rejects an email that belongs to another user', async () => {
    const user = new UserBuilder().build();
    const other = new UserBuilder()
      .withId('other-id')
      .withEmail('other@example.com')
      .build();
    users.insert(user);
    users.insert(other);

    await expect(
      useCase.execute({ id: user.id, email: 'other@example.com' }),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('throws when the user does not exist', async () => {
    await expect(
      useCase.execute({ id: 'missing', name: 'Aigerim' }),
    ).rejects.toBeInstanceOf(NotFoundApplicationException);
  });
});

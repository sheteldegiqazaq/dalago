import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import { InMemoryUserRepository } from '../testing/in-memory-user.repository';
import { UserBuilder } from '../testing/user.builder';
import { GetUserUseCase } from './get-user.use-case';

describe('GetUserUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: GetUserUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new GetUserUseCase(users);
  });

  it('should return user by id', async () => {
    users.insert(
      UserBuilder.user()
        .withId('user-id')
        .withEmail('user@example.com')
        .build(),
    );

    const user = await useCase.execute('user-id');

    expect(user.id).toBe('user-id');
    expect(user.email).toBe('user@example.com');
  });

  it('should throw when user does not exist', async () => {
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      NotFoundApplicationException,
    );
  });
});

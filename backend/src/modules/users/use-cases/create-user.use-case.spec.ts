import { DomainException } from '@shared/exceptions/domain.exception';
import { UserUniquenessService } from '../services/user-uniqueness.service';
import { InMemoryUserRepository } from '../testing/in-memory-user.repository';
import { UserBuilder } from '../testing/user.builder';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new CreateUserUseCase(users, new UserUniquenessService(users));
  });

  it('should create user', async () => {
    const user = await useCase.execute({
      email: 'USER@example.com',
      name: '  John Doe  ',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe('user@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.role).toBe('BUYER');
  });

  it('should throw when email already exists', async () => {
    users.insert(UserBuilder.user().withEmail('existing@example.com').build());

    await expect(
      useCase.execute({
        email: 'existing@example.com',
        name: 'John Doe',
      }),
    ).rejects.toThrow(DomainException);
  });
});

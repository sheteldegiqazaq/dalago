import { UnauthorizedApplicationException } from '@shared/exceptions/unauthorized.exception';
import { SessionService } from '../services/session.service';
import { FakePasswordHasher, FakeTokenIssuer } from '../testing/fakes';
import { InMemoryAccountRepository } from '../testing/in-memory-account.repository';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  let accounts: InMemoryAccountRepository;
  let useCase: LoginUseCase;

  beforeEach(async () => {
    accounts = new InMemoryAccountRepository();
    useCase = new LoginUseCase(
      accounts,
      new FakePasswordHasher(),
      new SessionService(new FakeTokenIssuer()),
    );
    await accounts.create({
      email: 'buyer@example.kz',
      name: 'Buyer',
      passwordHash: 'hashed:correct-pass',
      role: 'BUYER',
      preferredLanguage: 'ru',
      company: { name: 'Кафе', type: 'CAFE', cityId: 'semey', phone: '1' },
    });
  });

  it('returns token for valid credentials (email is case-insensitive)', async () => {
    const result = await useCase.execute({
      email: 'BUYER@example.kz',
      password: 'correct-pass',
    });

    expect(result.accessToken).toEqual(expect.stringContaining('token-for-'));
  });

  it('rejects wrong password', async () => {
    await expect(
      useCase.execute({ email: 'buyer@example.kz', password: 'nope' }),
    ).rejects.toBeInstanceOf(UnauthorizedApplicationException);
  });

  it('rejects unknown email with the same error', async () => {
    await expect(
      useCase.execute({ email: 'ghost@example.kz', password: 'x' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});

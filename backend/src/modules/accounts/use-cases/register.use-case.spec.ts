import { DomainException } from '@shared/exceptions/domain.exception';
import { SessionService } from '../services/session.service';
import { FakePasswordHasher, FakeTokenIssuer } from '../testing/fakes';
import { InMemoryAccountRepository } from '../testing/in-memory-account.repository';
import { type RegisterCommand, RegisterUseCase } from './register.use-case';

const command = (
  overrides: Partial<RegisterCommand> = {},
): RegisterCommand => ({
  email: '  Farmer@Example.KZ ',
  password: 'secret123',
  name: 'Айгерім',
  role: 'SUPPLIER',
  preferredLanguage: 'kk',
  company: {
    name: 'Ертіс бақшасы',
    type: 'FARM',
    cityId: 'semey',
    phone: '+7 700 000 00 00',
  },
  ...overrides,
});

describe('RegisterUseCase', () => {
  let accounts: InMemoryAccountRepository;
  let tokens: FakeTokenIssuer;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    accounts = new InMemoryAccountRepository();
    tokens = new FakeTokenIssuer();
    useCase = new RegisterUseCase(
      accounts,
      new FakePasswordHasher(),
      new SessionService(tokens),
    );
  });

  it('creates user with company, hashes password and issues token', async () => {
    const result = await useCase.execute(command());

    expect(result.account.email).toBe('farmer@example.kz');
    expect(result.account.passwordHash).toBe('hashed:secret123');
    expect(result.account.company?.name).toBe('Ертіс бақшасы');
    expect(tokens.lastClaims).toMatchObject({
      role: 'SUPPLIER',
      companyId: result.account.company?.id,
    });
  });

  it('rejects duplicate email', async () => {
    await useCase.execute(command());

    await expect(useCase.execute(command())).rejects.toMatchObject({
      code: 'EMAIL_TAKEN',
    });
  });

  it('rejects company type that does not match role', async () => {
    await expect(
      useCase.execute(
        command({
          company: { ...command().company, type: 'CAFE' },
        }),
      ),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('rejects unknown city', async () => {
    await expect(
      useCase.execute(
        command({ company: { ...command().company, cityId: 'moon' } }),
      ),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CITY' });
  });
});

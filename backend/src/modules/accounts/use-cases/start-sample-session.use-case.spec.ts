import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import { SessionService } from '../services/session.service';
import { FakeTokenIssuer } from '../testing/fakes';
import { InMemoryAccountRepository } from '../testing/in-memory-account.repository';
import { StartSampleSessionUseCase } from './start-sample-session.use-case';

describe('StartSampleSessionUseCase', () => {
  let accounts: InMemoryAccountRepository;
  let useCase: StartSampleSessionUseCase;

  const createAccount = async (
    email: string,
    role: 'BUYER' | 'SUPPLIER',
    isSample: boolean,
  ) => {
    const account = await accounts.create({
      email,
      name: email,
      passwordHash: 'hashed:x',
      role,
      preferredLanguage: 'ru',
      company: { name: email, type: 'CAFE', cityId: 'semey', phone: '1' },
    });
    account.company!.isSample = isSample;
    return account;
  };

  beforeEach(() => {
    accounts = new InMemoryAccountRepository();
    useCase = new StartSampleSessionUseCase(
      accounts,
      new SessionService(new FakeTokenIssuer()),
    );
  });

  it('starts a session in the sample account of the requested role', async () => {
    await createAccount('real-buyer@example.kz', 'BUYER', false);
    const sample = await createAccount('buyer@dalago.example', 'BUYER', true);

    const result = await useCase.execute({ role: 'BUYER' });

    expect(result.account.id).toBe(sample.id);
    expect(result.accessToken).toEqual(expect.stringContaining('token-for-'));
  });

  it('never opens a real account when no sample account exists', async () => {
    await createAccount('real-supplier@example.kz', 'SUPPLIER', false);

    await expect(useCase.execute({ role: 'SUPPLIER' })).rejects.toBeInstanceOf(
      NotFoundApplicationException,
    );
  });
});

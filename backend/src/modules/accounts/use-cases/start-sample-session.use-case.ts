import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { AccountRepository } from '../repositories/account.repository';
import type { SessionService } from '../services/session.service';

export type StartSampleSessionCommand = { role: 'BUYER' | 'SUPPLIER' };

/**
 * Вход без регистрации: сессия в общем аккаунте-примере нужной роли.
 * Доступны только аккаунты компаний с флагом isSample — реальные аккаунты так не получить.
 */
export class StartSampleSessionUseCase {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly sessions: SessionService,
  ) {}

  async execute(command: StartSampleSessionCommand) {
    const account = await this.accounts.findFirstSample(command.role);

    if (!account) {
      throw new NotFoundApplicationException(
        'Аккаунт-пример не найден',
        'SAMPLE_ACCOUNT_NOT_FOUND',
      );
    }

    return this.sessions.start(account);
  }
}

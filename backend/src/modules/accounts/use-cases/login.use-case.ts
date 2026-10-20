import { UnauthorizedApplicationException } from '@shared/exceptions/unauthorized.exception';
import type { PasswordHasher } from '../ports/password-hasher';
import type { AccountRepository } from '../repositories/account.repository';
import type { SessionService } from '../services/session.service';

export type LoginCommand = { email: string; password: string };

export class LoginUseCase {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionService,
  ) {}

  async execute(command: LoginCommand) {
    const account = await this.accounts.findByEmail(
      command.email.trim().toLowerCase(),
    );
    const isValid = account?.passwordHash
      ? await this.hasher.verify(command.password, account.passwordHash)
      : false;

    if (!account || !isValid) {
      // Одинаковый ответ для «нет пользователя» и «неверный пароль».
      throw new UnauthorizedApplicationException(
        'Неверный email или пароль',
        'INVALID_CREDENTIALS',
      );
    }

    return this.sessions.start(account);
  }
}

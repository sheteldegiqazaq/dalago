import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { AccountRepository } from '../repositories/account.repository';

export class GetMeUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(userId: string) {
    const account = await this.accounts.findById(userId);

    if (!account) {
      throw new NotFoundApplicationException('Пользователь не найден');
    }

    return account;
  }
}

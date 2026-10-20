import type { Language } from '@generated/prisma/client';
import type { AccountRepository } from '../repositories/account.repository';

export type UpdateMeCommand = {
  userId: string;
  name?: string;
  preferredLanguage?: Language;
};

export class UpdateMeUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  execute(command: UpdateMeCommand) {
    return this.accounts.update(command.userId, {
      name: command.name?.trim(),
      preferredLanguage: command.preferredLanguage,
    });
  }
}

import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { UserRepository } from '../repositories/user.repository';
import { UserUniquenessService } from '../services/user-uniqueness.service';
import { Email } from '../value-objects/email.vo';

export type UpdateUserCommand = {
  id: string;
  email?: string;
  name?: string;
};

export class UpdateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly uniqueness: UserUniquenessService,
  ) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.users.findById(command.id);

    if (!user) {
      throw new NotFoundApplicationException('User not found');
    }

    const email =
      command.email === undefined ? undefined : Email.create(command.email);

    if (email && email.value !== user.email) {
      await this.uniqueness.ensureEmailIsAvailable(email);
    }

    const updatedUser = await this.users.update(command.id, {
      email,
      name: command.name?.trim(),
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}

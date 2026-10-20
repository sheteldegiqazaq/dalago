import { UserRole } from '@generated/prisma/client';
import type { UserRepository } from '../repositories/user.repository';
import { UserUniquenessService } from '../services/user-uniqueness.service';
import { Email } from '../value-objects/email.vo';
export type CreateUserCommand = {
  email: string;
  name: string;
};

export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly uniqueness: UserUniquenessService,
  ) {}

  async execute(command: CreateUserCommand) {
    const email = Email.create(command.email);
    await this.uniqueness.ensureEmailIsAvailable(email);

    const savedUser = await this.users.save({
      email,
      name: command.name.trim(),
      role: UserRole.BUYER,
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}

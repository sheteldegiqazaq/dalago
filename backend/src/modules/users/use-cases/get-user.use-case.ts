import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { UserRepository } from '../repositories/user.repository';

export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string) {
    const user = await this.users.findById(id);

    if (!user) {
      throw new NotFoundApplicationException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

import type { Prisma } from '@generated/prisma/client';
import type { CreateUserData } from '../types/user.type';

export class PrismaUserMapper {
  static toPersistence(user: CreateUserData): Prisma.UserUncheckedCreateInput {
    return {
      email: user.email.value,
      name: user.name,
      role: user.role,
    };
  }
}

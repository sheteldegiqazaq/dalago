import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { User } from '@generated/prisma/client';
import type { CreateUserData, UpdateUserData } from '../types/user.type';
import { Email } from '../value-objects/email.vo';
import type { UserRepository } from './user.repository';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.value },
    });
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value },
    });

    return count > 0;
  }

  async save(user: CreateUserData): Promise<User> {
    const data = PrismaUserMapper.toPersistence(user);

    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email?.value,
        name: data.name,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

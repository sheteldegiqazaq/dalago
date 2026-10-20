import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { UserRole } from '@generated/prisma/client';
import type {
  Account,
  AccountRepository,
  CreateAccountData,
  UpdateAccountData,
} from './account.repository';

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<Account | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });
  }

  findById(id: string): Promise<Account | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  findFirstSample(role: UserRole): Promise<Account | null> {
    return this.prisma.user.findFirst({
      where: { role, company: { isSample: true } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { company: true },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    return (await this.prisma.user.count({ where: { email } })) > 0;
  }

  async cityExists(cityId: string): Promise<boolean> {
    return (await this.prisma.city.count({ where: { id: cityId } })) > 0;
  }

  create(data: CreateAccountData): Promise<Account> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
        preferredLanguage: data.preferredLanguage,
        company: { create: data.company },
      },
      include: { company: true },
    });
  }

  update(id: string, data: UpdateAccountData): Promise<Account> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { company: true },
    });
  }
}

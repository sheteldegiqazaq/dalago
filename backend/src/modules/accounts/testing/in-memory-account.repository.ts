import { randomUUID } from 'node:crypto';
import type { UserRole } from '@generated/prisma/client';
import type {
  Account,
  AccountRepository,
  CreateAccountData,
  UpdateAccountData,
} from '../repositories/account.repository';

export class InMemoryAccountRepository implements AccountRepository {
  readonly accounts = new Map<string, Account>();
  readonly cities = new Set(['semey']);

  findByEmail(email: string): Promise<Account | null> {
    const found = [...this.accounts.values()].find((a) => a.email === email);
    return Promise.resolve(found ?? null);
  }

  findById(id: string): Promise<Account | null> {
    return Promise.resolve(this.accounts.get(id) ?? null);
  }

  findFirstSample(role: UserRole): Promise<Account | null> {
    const found = [...this.accounts.values()]
      .filter((a) => a.role === role && a.company?.isSample)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    return Promise.resolve(found ?? null);
  }

  async emailExists(email: string): Promise<boolean> {
    return Boolean(await this.findByEmail(email));
  }

  cityExists(cityId: string): Promise<boolean> {
    return Promise.resolve(this.cities.has(cityId));
  }

  create(data: CreateAccountData): Promise<Account> {
    const now = new Date();
    const id = randomUUID();
    const account: Account = {
      id,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
      preferredLanguage: data.preferredLanguage,
      createdAt: now,
      updatedAt: now,
      company: {
        id: randomUUID(),
        ownerUserId: id,
        name: data.company.name,
        type: data.company.type,
        description: data.company.description ?? null,
        cityId: data.company.cityId,
        address: null,
        phone: data.company.phone,
        isSample: false,
        createdAt: now,
        updatedAt: now,
      },
    };
    this.accounts.set(id, account);

    return Promise.resolve(account);
  }

  update(id: string, data: UpdateAccountData): Promise<Account> {
    const account = this.accounts.get(id);

    if (!account) {
      return Promise.reject(new Error('not found'));
    }

    const updated = {
      ...account,
      name: data.name ?? account.name,
      preferredLanguage: data.preferredLanguage ?? account.preferredLanguage,
    };
    this.accounts.set(id, updated);

    return Promise.resolve(updated);
  }
}

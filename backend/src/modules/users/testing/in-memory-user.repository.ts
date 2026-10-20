import { randomUUID } from 'node:crypto';
import type { User } from '@generated/prisma/client';
import type { UserRepository } from '../repositories/user.repository';
import type { CreateUserData, UpdateUserData } from '../types/user.type';
import { Email } from '../value-objects/email.vo';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: Email): Promise<User | null> {
    const user =
      [...this.users.values()].find(
        (storedUser) => storedUser.email === email.value,
      ) ?? null;

    return Promise.resolve(user);
  }

  async exists(email: Email): Promise<boolean> {
    return Boolean(await this.findByEmail(email));
  }

  save(user: CreateUserData): Promise<User> {
    const now = new Date();
    const savedUser: User = {
      id: randomUUID(),
      email: user.email.value,
      name: user.name,
      role: user.role,
      passwordHash: null,
      preferredLanguage: 'kk',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(savedUser.id, savedUser);

    return Promise.resolve(savedUser);
  }

  update(id: string, data: UpdateUserData): Promise<User> {
    const user = this.users.get(id);

    if (!user) {
      return Promise.reject(new Error(`User ${id} not found`));
    }

    const updatedUser: User = {
      ...user,
      email: data.email?.value ?? user.email,
      name: data.name ?? user.name,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);

    return Promise.resolve(updatedUser);
  }

  insert(user: User): void {
    this.users.set(user.id, user);
  }

  delete(id: string): Promise<void> {
    this.users.delete(id);

    return Promise.resolve();
  }

  clear(): void {
    this.users.clear();
  }
}

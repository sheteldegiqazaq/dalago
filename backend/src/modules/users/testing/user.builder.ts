import type { User, UserRole } from '@generated/prisma/client';

export class UserBuilder {
  private id = 'user-id';
  private email = 'user@example.com';
  private name = 'User';
  private role: UserRole = 'BUYER';
  private createdAt = new Date('2026-01-01T00:00:00.000Z');
  private updatedAt = new Date('2026-01-01T00:00:00.000Z');

  static user(): UserBuilder {
    return new UserBuilder();
  }

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.email = email;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withAdminRole(): this {
    this.role = 'ADMIN';
    return this;
  }

  build(): User {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      passwordHash: null,
      preferredLanguage: 'kk',
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

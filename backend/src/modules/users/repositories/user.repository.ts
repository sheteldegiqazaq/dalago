import type { User } from '@generated/prisma/client';
import type { CreateUserData, UpdateUserData } from '../types/user.type';
import { Email } from '../value-objects/email.vo';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  exists(email: Email): Promise<boolean>;
  save(user: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

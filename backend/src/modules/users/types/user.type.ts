import type { UserRole } from '@generated/prisma/client';
import type { Email } from '../value-objects/email.vo';

export type CreateUserData = {
  email: Email;
  name: string;
  role: UserRole;
};

export type UpdateUserData = {
  email?: Email;
  name?: string;
};

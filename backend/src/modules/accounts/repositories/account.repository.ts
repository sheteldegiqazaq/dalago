import type {
  Company,
  CompanyType,
  Language,
  User,
  UserRole,
} from '@generated/prisma/client';

export type Account = User & { company: Company | null };

export type CreateAccountData = {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  preferredLanguage: Language;
  company: {
    name: string;
    type: CompanyType;
    cityId: string;
    phone: string;
    description?: string;
  };
};

export type UpdateAccountData = {
  name?: string;
  preferredLanguage?: Language;
};

export interface AccountRepository {
  findByEmail(email: string): Promise<Account | null>;
  findById(id: string): Promise<Account | null>;
  /** Самый ранний аккаунт компании-примера с этой ролью (порядок сида стабилен). */
  findFirstSample(role: UserRole): Promise<Account | null>;
  emailExists(email: string): Promise<boolean>;
  cityExists(cityId: string): Promise<boolean>;
  /** Пользователь и его компания создаются атомарно (вложенный create). */
  create(data: CreateAccountData): Promise<Account>;
  update(id: string, data: UpdateAccountData): Promise<Account>;
}

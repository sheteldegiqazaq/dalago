import type { CompanyType, Language } from '@generated/prisma/client';
import { DomainException } from '@shared/exceptions/domain.exception';
import type { PasswordHasher } from '../ports/password-hasher';
import type { AccountRepository } from '../repositories/account.repository';
import { isCompanyTypeAllowed } from '../services/company-type-policy';
import type { SessionService } from '../services/session.service';

export type RegisterCommand = {
  email: string;
  password: string;
  name: string;
  role: 'BUYER' | 'SUPPLIER';
  preferredLanguage: Language;
  company: {
    name: string;
    type: CompanyType;
    cityId: string;
    phone: string;
    description?: string;
  };
};

export class RegisterUseCase {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionService,
  ) {}

  async execute(command: RegisterCommand) {
    const email = command.email.trim().toLowerCase();

    if (await this.accounts.emailExists(email)) {
      throw new DomainException(
        'Этот email уже зарегистрирован',
        'EMAIL_TAKEN',
      );
    }

    if (!isCompanyTypeAllowed(command.role, command.company.type)) {
      throw new DomainException(
        'Тип компании не подходит для выбранной роли',
        'COMPANY_TYPE_MISMATCH',
      );
    }

    if (!(await this.accounts.cityExists(command.company.cityId))) {
      throw new DomainException('Неизвестный город', 'UNKNOWN_CITY');
    }

    const account = await this.accounts.create({
      email,
      name: command.name.trim(),
      passwordHash: await this.hasher.hash(command.password),
      role: command.role,
      preferredLanguage: command.preferredLanguage,
      company: {
        name: command.company.name.trim(),
        type: command.company.type,
        cityId: command.company.cityId,
        phone: command.company.phone.trim(),
        description: command.company.description?.trim() || undefined,
      },
    });

    return this.sessions.start(account);
  }
}

import { DomainException } from '@shared/exceptions/domain.exception';
import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type {
  CompanyProfileData,
  CompanyRepository,
} from '../repositories/company.repository';

export class UpdateMyCompanyUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(companyId: string | undefined, data: CompanyProfileData) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    if (!(await this.companies.cityExists(data.cityId))) {
      throw new DomainException('Неизвестный город', 'UNKNOWN_CITY');
    }

    return this.companies.updateProfile(companyId, {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      cityId: data.cityId,
      address: data.address?.trim() || null,
      phone: data.phone.trim(),
    });
  }
}

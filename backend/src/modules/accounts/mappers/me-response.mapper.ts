import type { MeResponseDto } from '../dto/me-response.dto';
import type { Account } from '../repositories/account.repository';

export class MeResponseMapper {
  static toHttp(account: Account): MeResponseDto {
    const { company } = account;

    return {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      preferredLanguage: account.preferredLanguage,
      company: company
        ? {
            id: company.id,
            name: company.name,
            type: company.type,
            description: company.description,
            cityId: company.cityId,
            address: company.address,
            phone: company.phone,
            isDemo: company.isDemo,
          }
        : null,
    };
  }
}

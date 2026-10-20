import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { CompanyRepository } from '../repositories/company.repository';

export class GetSupplierUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(id: string) {
    const supplier = await this.companies.findSupplier(id);

    if (!supplier) {
      throw new NotFoundApplicationException(
        'Поставщик не найден',
        'SUPPLIER_NOT_FOUND',
      );
    }

    return supplier;
  }
}

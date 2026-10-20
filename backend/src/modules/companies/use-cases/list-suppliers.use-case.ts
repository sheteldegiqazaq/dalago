import type {
  CompanyRepository,
  SupplierCriteria,
} from '../repositories/company.repository';

export class ListSuppliersUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  execute(criteria: SupplierCriteria) {
    return this.companies.listSuppliers({
      ...criteria,
      q: criteria.q?.trim() || undefined,
    });
  }
}

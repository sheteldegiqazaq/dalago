import type { CompanyRepository } from '../repositories/company.repository';

export class GetCityStatsUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  execute() {
    return this.companies.statsByCity();
  }
}

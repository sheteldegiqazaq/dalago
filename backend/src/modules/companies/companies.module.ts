import { Module } from '@nestjs/common';
import { COMPANY_REPOSITORY } from './companies.tokens';
import { CompaniesController } from './controllers/companies.controller';
import type { CompanyRepository } from './repositories/company.repository';
import { PrismaCompanyRepository } from './repositories/prisma-company.repository';
import { GetCityStatsUseCase } from './use-cases/get-city-stats.use-case';
import { GetSupplierUseCase } from './use-cases/get-supplier.use-case';
import { ListSuppliersUseCase } from './use-cases/list-suppliers.use-case';
import { UpdateMyCompanyUseCase } from './use-cases/update-my-company.use-case';

const useCases = [
  ListSuppliersUseCase,
  GetSupplierUseCase,
  GetCityStatsUseCase,
  UpdateMyCompanyUseCase,
] as const;

@Module({
  controllers: [CompaniesController],
  providers: [
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
    ...useCases.map((UseCase) => ({
      provide: UseCase,
      useFactory: (companies: CompanyRepository) => new UseCase(companies),
      inject: [COMPANY_REPOSITORY],
    })),
  ],
})
export class CompaniesModule {}

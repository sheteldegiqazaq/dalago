import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DASHBOARD_REPOSITORY } from './dashboard.tokens';
import type { DashboardRepository } from './repositories/dashboard.repository';
import { PrismaDashboardRepository } from './repositories/prisma-dashboard.repository';
import { GetDashboardUseCase } from './use-cases/get-dashboard.use-case';
import { GetMarketplaceStatsUseCase } from './use-cases/get-marketplace-stats.use-case';

@Module({
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: PrismaDashboardRepository },
    ...[GetDashboardUseCase, GetMarketplaceStatsUseCase].map((UseCase) => ({
      provide: UseCase,
      useFactory: (dashboard: DashboardRepository) => new UseCase(dashboard),
      inject: [DASHBOARD_REPOSITORY],
    })),
  ],
})
export class DashboardModule {}

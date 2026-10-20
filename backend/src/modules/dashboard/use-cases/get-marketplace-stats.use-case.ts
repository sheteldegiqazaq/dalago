import type { DashboardRepository } from '../repositories/dashboard.repository';

export class GetMarketplaceStatsUseCase {
  constructor(private readonly dashboard: DashboardRepository) {}

  execute() {
    return this.dashboard.marketplaceStats();
  }
}

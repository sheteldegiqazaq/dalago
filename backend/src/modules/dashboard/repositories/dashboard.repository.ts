import type {
  ActivityItem,
  BuyerSummary,
  MarketplaceStats,
  SupplierSummary,
} from '../types/dashboard.type';

export interface DashboardRepository {
  supplierSummary(companyId: string): Promise<SupplierSummary>;
  buyerSummary(companyId: string): Promise<BuyerSummary>;
  supplierActivity(companyId: string, limit: number): Promise<ActivityItem[]>;
  buyerActivity(companyId: string, limit: number): Promise<ActivityItem[]>;
  marketplaceStats(): Promise<MarketplaceStats>;
}

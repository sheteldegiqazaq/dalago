import type { UserRole } from '@generated/prisma/client';
import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { DashboardRepository } from '../repositories/dashboard.repository';

const ACTIVITY_LIMIT = 10;

export class GetDashboardUseCase {
  constructor(private readonly dashboard: DashboardRepository) {}

  async execute(role: UserRole | undefined, companyId: string | undefined) {
    if (!companyId || (role !== 'SUPPLIER' && role !== 'BUYER')) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    if (role === 'SUPPLIER') {
      const [supplier, activity] = await Promise.all([
        this.dashboard.supplierSummary(companyId),
        this.dashboard.supplierActivity(companyId, ACTIVITY_LIMIT),
      ]);

      return { role, supplier, buyer: null, activity };
    }

    const [buyer, activity] = await Promise.all([
      this.dashboard.buyerSummary(companyId),
      this.dashboard.buyerActivity(companyId, ACTIVITY_LIMIT),
    ]);

    return { role, supplier: null, buyer, activity };
  }
}

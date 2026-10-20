import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import type { RequestStatusFilter } from '../types/procurement.type';

export class ListMyRequestsUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  execute(companyId: string | undefined, status?: RequestStatusFilter) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    return this.procurement.listByBuyer(companyId, status);
  }
}

import type { ProcurementRepository } from '../repositories/procurement.repository';
import type { OpenRequestCriteria } from '../types/procurement.type';

export class ListActiveRequestsUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  execute(criteria: OpenRequestCriteria) {
    return this.procurement.listActive({
      ...criteria,
      q: criteria.q?.trim() || undefined,
    });
  }
}

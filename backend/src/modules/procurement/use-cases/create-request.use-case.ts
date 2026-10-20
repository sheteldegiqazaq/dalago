import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import { type RequestInput, toRequestData } from '../services/request-input';

export class CreateRequestUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  async execute(companyId: string | undefined, input: RequestInput) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    const data = await toRequestData(this.procurement, input);

    return this.procurement.createRequest(companyId, data);
  }
}

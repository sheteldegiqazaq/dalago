import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import {
  assertRequestModifiable,
  assertRequestOwner,
} from '../services/request-lifecycle';

export class CloseRequestUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  async execute(id: string, companyId: string | undefined) {
    const request = await this.procurement.findRequest(id);

    if (!request) {
      throw new NotFoundApplicationException(
        'Заявка не найдена',
        'REQUEST_NOT_FOUND',
      );
    }

    assertRequestOwner(request, companyId);
    assertRequestModifiable(request);

    return this.procurement.closeRequest(id);
  }
}

import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';

export class ListMyOffersUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  execute(companyId: string | undefined) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    return this.procurement.listOffersBySupplier(companyId);
  }
}

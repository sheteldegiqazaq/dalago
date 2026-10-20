import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import { type OfferInput, toOfferData } from '../services/offer-input';
import { assertCanSubmitOffer } from '../services/request-lifecycle';

export class CreateOfferUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  async execute(
    requestId: string,
    supplierCompanyId: string | undefined,
    input: OfferInput,
  ) {
    if (!supplierCompanyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    const request = await this.procurement.findRequest(requestId);

    if (!request) {
      throw new NotFoundApplicationException(
        'Заявка не найдена',
        'REQUEST_NOT_FOUND',
      );
    }

    assertCanSubmitOffer(
      request,
      supplierCompanyId,
      await this.procurement.hasOffer(requestId, supplierCompanyId),
    );

    const data = await toOfferData(this.procurement, input, {
      supplierCompanyId,
      requestQuantity: request.quantity.toNumber(),
    });

    return this.procurement.createOffer(requestId, supplierCompanyId, data);
  }
}

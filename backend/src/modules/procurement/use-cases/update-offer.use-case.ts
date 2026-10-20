import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import { type OfferInput, toOfferData } from '../services/offer-input';
import { assertOfferEditable } from '../services/request-lifecycle';

export class UpdateOfferUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  async execute(
    offerId: string,
    supplierCompanyId: string | undefined,
    input: OfferInput,
  ) {
    const offer = await this.procurement.findOffer(offerId);
    const request = offer
      ? await this.procurement.findRequest(offer.requestId)
      : null;

    if (!offer || !request) {
      throw new NotFoundApplicationException(
        'Предложение не найдено',
        'OFFER_NOT_FOUND',
      );
    }

    assertOfferEditable(offer, request, supplierCompanyId);

    const data = await toOfferData(this.procurement, input, {
      supplierCompanyId: offer.supplierCompanyId,
      requestQuantity: request.quantity.toNumber(),
    });

    return this.procurement.updateOffer(offerId, data);
  }
}

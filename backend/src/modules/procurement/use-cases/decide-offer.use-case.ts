import { DomainException } from '@shared/exceptions/domain.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import { assertOfferDecidable } from '../services/request-lifecycle';

export type OfferDecision = 'accept' | 'reject';

/** Покупатель принимает или отклоняет предложение по своей заявке. */
export class DecideOfferUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  async execute(
    offerId: string,
    buyerCompanyId: string | undefined,
    decision: OfferDecision,
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

    assertOfferDecidable(offer, request, buyerCompanyId);

    const applied =
      decision === 'accept'
        ? await this.procurement.acceptOffer(offerId, request.id)
        : await this.procurement.rejectOffer(offerId);

    if (!applied) {
      throw new DomainException(
        'Состояние заявки изменилось, обновите страницу',
        'STALE_STATE',
      );
    }

    return (await this.procurement.findRequest(request.id))!;
  }
}

import type { RequestDetailsRecord } from '../repositories/procurement.select';
import { isRequestActive } from './request-lifecycle';

export type RequestViewer = { companyId?: string; role?: string };

/**
 * Кто что видит в заявке:
 * - автор-покупатель: всё, включая все предложения;
 * - поставщик: заявку и только своё предложение;
 * - остальные: только активные заявки и без предложений и телефона покупателя.
 * null — заявка скрыта (закрытая/исполненная для постороннего).
 */
export function visibleRequestFor(
  request: RequestDetailsRecord,
  viewer: RequestViewer,
) {
  const isOwner =
    Boolean(viewer.companyId) && request.buyerCompanyId === viewer.companyId;
  const myOffer = request.offers.find(
    (offer) => offer.supplierCompanyId === viewer.companyId,
  );
  const isParticipant = isOwner || Boolean(myOffer);

  if (!isRequestActive(request.status) && !isParticipant) {
    return null;
  }

  return {
    request,
    isOwner,
    offers: isOwner ? request.offers : myOffer ? [myOffer] : [],
    showBuyerPhone: isParticipant,
    myOfferId: myOffer?.id ?? null,
    canOffer:
      viewer.role === 'SUPPLIER' &&
      !isOwner &&
      !myOffer &&
      isRequestActive(request.status),
  };
}

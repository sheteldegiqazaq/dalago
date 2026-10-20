import type { OfferStatus, RequestStatus } from '@generated/prisma/client';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';

/**
 * Жизненный цикл оптовой заявки:
 *
 *   OPEN ──(первое предложение)──▶ OFFERS_RECEIVED ──(принято)──▶ ACCEPTED
 *     │                                   │
 *     └──────────(покупатель закрыл)──────┴──────────────▶ CLOSED
 *
 * ACCEPTED и CLOSED — финальные состояния.
 */
export const ACTIVE_REQUEST_STATUSES: RequestStatus[] = [
  'OPEN',
  'OFFERS_RECEIVED',
];

export function isRequestActive(status: RequestStatus): boolean {
  return ACTIVE_REQUEST_STATUSES.includes(status);
}

type RequestState = { status: RequestStatus; buyerCompanyId: string };
type OfferState = { status: OfferStatus; supplierCompanyId: string };

export function statusAfterNewOffer(status: RequestStatus): RequestStatus {
  if (!isRequestActive(status)) {
    throw requestNotActive();
  }

  return 'OFFERS_RECEIVED';
}

export function assertRequestOwner(
  request: RequestState,
  companyId: string | undefined,
): void {
  if (!companyId || request.buyerCompanyId !== companyId) {
    throw new ForbiddenApplicationException(
      'Действие доступно только автору заявки',
      'NOT_REQUEST_OWNER',
    );
  }
}

/** Редактировать или закрыть можно только активную заявку. */
export function assertRequestModifiable(request: RequestState): void {
  if (!isRequestActive(request.status)) {
    throw requestNotActive();
  }
}

export function assertCanSubmitOffer(
  request: RequestState,
  supplierCompanyId: string,
  alreadyOffered: boolean,
): void {
  if (!isRequestActive(request.status)) {
    throw requestNotActive();
  }

  if (request.buyerCompanyId === supplierCompanyId) {
    throw new DomainException(
      'Нельзя отвечать на собственную заявку',
      'OWN_REQUEST',
    );
  }

  if (alreadyOffered) {
    throw new DomainException(
      'Вы уже отправили предложение по этой заявке',
      'OFFER_ALREADY_EXISTS',
    );
  }
}

export function assertOfferEditable(
  offer: OfferState,
  request: RequestState,
  supplierCompanyId: string | undefined,
): void {
  if (!supplierCompanyId || offer.supplierCompanyId !== supplierCompanyId) {
    throw new ForbiddenApplicationException(
      'Можно изменять только свои предложения',
      'NOT_OFFER_OWNER',
    );
  }

  if (offer.status !== 'PENDING' || !isRequestActive(request.status)) {
    throw new DomainException(
      'Предложение уже рассмотрено и не может быть изменено',
      'OFFER_NOT_PENDING',
    );
  }
}

/** Принять или отклонить можно только ожидающее предложение по активной заявке. */
export function assertOfferDecidable(
  offer: OfferState,
  request: RequestState,
  buyerCompanyId: string | undefined,
): void {
  assertRequestOwner(request, buyerCompanyId);

  if (!isRequestActive(request.status)) {
    throw requestNotActive();
  }

  if (offer.status !== 'PENDING') {
    throw new DomainException(
      'Предложение уже рассмотрено',
      'OFFER_NOT_PENDING',
    );
  }
}

function requestNotActive() {
  return new DomainException(
    'Заявка уже закрыта или по ней принято предложение',
    'REQUEST_NOT_ACTIVE',
  );
}

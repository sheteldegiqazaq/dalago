import { DomainException } from '@shared/exceptions/domain.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import type { OfferWriteData } from '../types/procurement.type';
import { parseFutureDate } from './date-rules';

export type OfferInput = Omit<OfferWriteData, 'estimatedDeliveryDate'> & {
  estimatedDeliveryDate: string;
};

export async function toOfferData(
  repository: ProcurementRepository,
  input: OfferInput,
  context: { supplierCompanyId: string; requestQuantity: number },
): Promise<OfferWriteData> {
  if (input.quantity > context.requestQuantity) {
    throw new DomainException(
      'Объём предложения больше, чем нужно покупателю',
      'OFFER_QTY_EXCEEDS_REQUEST',
    );
  }

  if (
    input.productId &&
    !(await repository.productBelongsTo(
      input.productId,
      context.supplierCompanyId,
    ))
  ) {
    throw new DomainException(
      'Можно прикрепить только своё объявление',
      'PRODUCT_NOT_OWNED',
    );
  }

  return {
    ...input,
    terms: input.terms?.trim() || null,
    estimatedDeliveryDate: parseFutureDate(
      input.estimatedDeliveryDate,
      'DELIVERY_DATE_IN_PAST',
    ),
  };
}

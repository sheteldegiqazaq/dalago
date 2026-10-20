import { DomainException } from '@shared/exceptions/domain.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import type { RequestWriteData } from '../types/procurement.type';
import { parseFutureDate } from './date-rules';

export type RequestInput = Omit<RequestWriteData, 'desiredDate'> & {
  desiredDate: string;
};

export async function toRequestData(
  repository: ProcurementRepository,
  input: RequestInput,
): Promise<RequestWriteData> {
  if (
    input.categoryId &&
    !(await repository.categoryExists(input.categoryId))
  ) {
    throw new DomainException('Неизвестная категория', 'UNKNOWN_CATEGORY');
  }

  if (!(await repository.cityExists(input.deliveryCityId))) {
    throw new DomainException('Неизвестный город', 'UNKNOWN_CITY');
  }

  return {
    ...input,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    deliveryAddress: input.deliveryAddress?.trim() || null,
    desiredDate: parseFutureDate(input.desiredDate, 'DESIRED_DATE_IN_PAST'),
  };
}

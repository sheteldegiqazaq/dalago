import { DomainException } from '@shared/exceptions/domain.exception';
import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { InquiryContext } from '../repositories/inquiry.repository';

type Participants = { fromCompanyId: string; toCompanyId: string };

export function isParticipant(
  inquiry: Participants,
  companyId: string | undefined,
) {
  return (
    Boolean(companyId) &&
    (inquiry.fromCompanyId === companyId || inquiry.toCompanyId === companyId)
  );
}

/** Переписку видят только две компании-участницы. Посторонним — 404, чтобы не раскрывать её существование. */
export function assertParticipant(
  inquiry: Participants | null,
  companyId: string | undefined,
): asserts inquiry is Participants {
  if (!inquiry || !isParticipant(inquiry, companyId)) {
    throw new NotFoundApplicationException(
      'Обращение не найдено',
      'INQUIRY_NOT_FOUND',
    );
  }
}

export function assertCanStart(
  fromCompanyId: string | undefined,
  toCompanyId: string,
  context: InquiryContext,
  links: { productId: string | null; requestId: string | null },
): asserts fromCompanyId is string {
  if (!fromCompanyId) {
    throw new ForbiddenApplicationException(
      'Нет профиля компании',
      'NO_COMPANY',
    );
  }

  if (fromCompanyId === toCompanyId) {
    throw new DomainException('Нельзя написать своей компании', 'SELF_INQUIRY');
  }

  if (!context.companyExists) {
    throw new NotFoundApplicationException(
      'Компания не найдена',
      'COMPANY_NOT_FOUND',
    );
  }

  const pair = [fromCompanyId, toCompanyId];
  const productOk =
    !links.productId || pair.includes(context.productOwnerId ?? '');
  const requestOk =
    !links.requestId || pair.includes(context.requestOwnerId ?? '');

  if (!productOk || !requestOk) {
    throw new DomainException(
      'Товар или заявка не относятся к этим компаниям',
      'INQUIRY_LINK_MISMATCH',
    );
  }
}

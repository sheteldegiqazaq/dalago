import { ForbiddenApplicationException } from '@shared/exceptions/forbidden.exception';
import type { InquiryRepository } from '../repositories/inquiry.repository';

export class ListInquiriesUseCase {
  constructor(private readonly inquiries: InquiryRepository) {}

  execute(companyId: string | undefined) {
    if (!companyId) {
      throw new ForbiddenApplicationException(
        'Нет профиля компании',
        'NO_COMPANY',
      );
    }

    return this.inquiries.listForCompany(companyId);
  }
}

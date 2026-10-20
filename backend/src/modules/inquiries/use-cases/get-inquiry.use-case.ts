import type { InquiryRepository } from '../repositories/inquiry.repository';
import { assertParticipant } from '../services/inquiry-access';

export class GetInquiryUseCase {
  constructor(private readonly inquiries: InquiryRepository) {}

  async execute(id: string, companyId: string | undefined) {
    const inquiry = await this.inquiries.findById(id);
    assertParticipant(inquiry, companyId);

    return inquiry;
  }
}

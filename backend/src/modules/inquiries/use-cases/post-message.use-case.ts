import type { InquiryRepository } from '../repositories/inquiry.repository';
import { assertParticipant } from '../services/inquiry-access';

export class PostMessageUseCase {
  constructor(private readonly inquiries: InquiryRepository) {}

  async execute(
    inquiryId: string,
    companyId: string | undefined,
    authorUserId: string,
    body: string,
  ) {
    assertParticipant(await this.inquiries.findById(inquiryId), companyId);
    await this.inquiries.addMessage(inquiryId, authorUserId, body.trim());

    return (await this.inquiries.findById(inquiryId))!;
  }
}

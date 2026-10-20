import type { InquiryRepository } from '../repositories/inquiry.repository';
import { assertCanStart } from '../services/inquiry-access';

export type StartInquiryCommand = {
  fromCompanyId: string | undefined;
  authorUserId: string;
  toCompanyId: string;
  productId: string | null;
  requestId: string | null;
  subject: string;
  body: string;
};

export class StartInquiryUseCase {
  constructor(private readonly inquiries: InquiryRepository) {}

  /** Если переписка по этому товару/заявке уже есть — дописываем в неё. */
  async execute(command: StartInquiryCommand) {
    const links = {
      productId: command.productId,
      requestId: command.requestId,
    };
    const context = await this.inquiries.context(
      command.toCompanyId,
      links.productId,
      links.requestId,
    );
    assertCanStart(command.fromCompanyId, command.toCompanyId, context, links);

    const body = command.body.trim();
    const existingId = await this.inquiries.findThread({
      fromCompanyId: command.fromCompanyId,
      toCompanyId: command.toCompanyId,
      ...links,
    });

    if (existingId) {
      await this.inquiries.addMessage(existingId, command.authorUserId, body);
      return (await this.inquiries.findById(existingId))!;
    }

    return this.inquiries.create({
      fromCompanyId: command.fromCompanyId,
      toCompanyId: command.toCompanyId,
      ...links,
      subject: command.subject.trim(),
      authorUserId: command.authorUserId,
      body,
    });
  }
}

import type { InquiryDetailsDto, InquiryListItemDto } from '../dto/inquiry.dto';
import type {
  InquiryDetailsRecord,
  InquiryListRecord,
} from '../repositories/inquiry.select';

export class InquiryMapper {
  static toListItem(
    inquiry: InquiryListRecord,
    companyId: string,
  ): InquiryListItemDto {
    const counterpart =
      inquiry.fromCompanyId === companyId
        ? inquiry.toCompany
        : inquiry.fromCompany;
    const last = inquiry.messages[0];

    return {
      id: inquiry.id,
      subject: inquiry.subject,
      counterpart,
      product: inquiry.product,
      request: inquiry.request,
      lastMessage: last?.body ?? null,
      lastFromCounterpart:
        Boolean(last) && last.author.company?.id !== companyId,
      messageCount: inquiry._count.messages,
      isSample: inquiry.isSample,
      updatedAt: inquiry.updatedAt.toISOString(),
    };
  }

  static toDetails(
    inquiry: InquiryDetailsRecord,
    companyId: string,
  ): InquiryDetailsDto {
    const counterpart =
      inquiry.fromCompanyId === companyId
        ? inquiry.toCompany
        : inquiry.fromCompany;
    const last = inquiry.messages.at(-1);

    return {
      id: inquiry.id,
      subject: inquiry.subject,
      counterpart,
      product: inquiry.product,
      request: inquiry.request,
      lastMessage: last?.body ?? null,
      lastFromCounterpart:
        Boolean(last) && last?.author.company?.id !== companyId,
      messageCount: inquiry.messages.length,
      isSample: inquiry.isSample,
      updatedAt: inquiry.updatedAt.toISOString(),
      messages: inquiry.messages.map((message) => ({
        id: message.id,
        body: message.body,
        authorName: message.author.name,
        mine: message.author.company?.id === companyId,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  }
}

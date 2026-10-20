import type { InquiryDetailsRecord, InquiryListRecord } from './inquiry.select';

export type StartInquiryData = {
  fromCompanyId: string;
  toCompanyId: string;
  productId: string | null;
  requestId: string | null;
  subject: string;
  authorUserId: string;
  body: string;
};

export type InquiryContext = {
  companyExists: boolean;
  productOwnerId: string | null;
  requestOwnerId: string | null;
};

export interface InquiryRepository {
  context(
    toCompanyId: string,
    productId: string | null,
    requestId: string | null,
  ): Promise<InquiryContext>;
  findThread(
    data: Pick<
      StartInquiryData,
      'fromCompanyId' | 'toCompanyId' | 'productId' | 'requestId'
    >,
  ): Promise<string | null>;
  create(data: StartInquiryData): Promise<InquiryDetailsRecord>;
  addMessage(
    inquiryId: string,
    authorUserId: string,
    body: string,
  ): Promise<void>;
  listForCompany(companyId: string): Promise<InquiryListRecord[]>;
  findById(id: string): Promise<InquiryDetailsRecord | null>;
}

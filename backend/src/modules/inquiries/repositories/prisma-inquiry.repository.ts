import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type {
  InquiryContext,
  InquiryRepository,
  StartInquiryData,
} from './inquiry.repository';
import {
  type InquiryDetailsRecord,
  inquiryDetailsSelect,
  type InquiryListRecord,
  inquiryListSelect,
} from './inquiry.select';

@Injectable()
export class PrismaInquiryRepository implements InquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async context(
    toCompanyId: string,
    productId: string | null,
    requestId: string | null,
  ): Promise<InquiryContext> {
    const [company, product, request] = await Promise.all([
      this.prisma.company.count({ where: { id: toCompanyId } }),
      productId
        ? this.prisma.product.findUnique({
            where: { id: productId },
            select: { supplierCompanyId: true },
          })
        : null,
      requestId
        ? this.prisma.purchaseRequest.findUnique({
            where: { id: requestId },
            select: { buyerCompanyId: true },
          })
        : null,
    ]);

    return {
      companyExists: company > 0,
      productOwnerId: product?.supplierCompanyId ?? null,
      requestOwnerId: request?.buyerCompanyId ?? null,
    };
  }

  async findThread(
    data: Pick<
      StartInquiryData,
      'fromCompanyId' | 'toCompanyId' | 'productId' | 'requestId'
    >,
  ): Promise<string | null> {
    const pair = [
      { fromCompanyId: data.fromCompanyId, toCompanyId: data.toCompanyId },
      { fromCompanyId: data.toCompanyId, toCompanyId: data.fromCompanyId },
    ];
    const thread = await this.prisma.inquiry.findFirst({
      where: { OR: pair, productId: data.productId, requestId: data.requestId },
      select: { id: true },
    });

    return thread?.id ?? null;
  }

  create(data: StartInquiryData): Promise<InquiryDetailsRecord> {
    return this.prisma.inquiry.create({
      data: {
        fromCompanyId: data.fromCompanyId,
        toCompanyId: data.toCompanyId,
        productId: data.productId,
        requestId: data.requestId,
        subject: data.subject,
        messages: {
          create: { authorUserId: data.authorUserId, body: data.body },
        },
      },
      select: inquiryDetailsSelect,
    });
  }

  async addMessage(
    inquiryId: string,
    authorUserId: string,
    body: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.inquiryMessage.create({
        data: { inquiryId, authorUserId, body },
      }),
      this.prisma.inquiry.update({
        where: { id: inquiryId },
        data: { updatedAt: new Date() },
      }),
    ]);
  }

  listForCompany(companyId: string): Promise<InquiryListRecord[]> {
    return this.prisma.inquiry.findMany({
      where: { OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }] },
      select: inquiryListSelect,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string): Promise<InquiryDetailsRecord | null> {
    return this.prisma.inquiry.findUnique({
      where: { id },
      select: inquiryDetailsSelect,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { Prisma } from '@generated/prisma/client';
import type { Paginated } from '@shared/pagination/pagination';
import { ACTIVE_REQUEST_STATUSES } from '../services/request-lifecycle';
import type {
  OfferWriteData,
  OpenRequestCriteria,
  RequestStatusFilter,
  RequestWriteData,
} from '../types/procurement.type';
import type { ProcurementRepository } from './procurement.repository';
import {
  type OfferRecord,
  offerSelect,
  type RequestDetailsRecord,
  type RequestListRecord,
  requestDetailsSelect,
  requestListSelect,
  type SupplierOfferRecord,
  supplierOfferSelect,
} from './procurement.select';

@Injectable()
export class PrismaProcurementRepository implements ProcurementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(
    criteria: OpenRequestCriteria,
  ): Promise<Paginated<RequestListRecord>> {
    const where: Prisma.PurchaseRequestWhereInput = {
      status: { in: ACTIVE_REQUEST_STATUSES },
      category: criteria.categorySlug
        ? { slug: criteria.categorySlug }
        : undefined,
      deliveryCityId: criteria.cityId,
      OR: criteria.q
        ? [
            { title: { contains: criteria.q, mode: 'insensitive' } },
            { description: { contains: criteria.q, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.purchaseRequest.findMany({
        where,
        select: requestListSelect,
        orderBy: [{ desiredDate: 'asc' }, { id: 'asc' }],
        skip: (criteria.page - 1) * criteria.limit,
        take: criteria.limit,
      }),
      this.prisma.purchaseRequest.count({ where }),
    ]);

    return { items, total, page: criteria.page, limit: criteria.limit };
  }

  listByBuyer(
    companyId: string,
    status?: RequestStatusFilter,
  ): Promise<RequestListRecord[]> {
    return this.prisma.purchaseRequest.findMany({
      where: {
        buyerCompanyId: companyId,
        status: status === 'ACTIVE' ? { in: ACTIVE_REQUEST_STATUSES } : status,
      },
      select: requestListSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findRequest(id: string): Promise<RequestDetailsRecord | null> {
    return this.prisma.purchaseRequest.findUnique({
      where: { id },
      select: requestDetailsSelect,
    });
  }

  createRequest(
    buyerCompanyId: string,
    data: RequestWriteData,
  ): Promise<RequestDetailsRecord> {
    return this.prisma.purchaseRequest.create({
      data: { ...data, buyerCompanyId },
      select: requestDetailsSelect,
    });
  }

  updateRequest(
    id: string,
    data: RequestWriteData,
  ): Promise<RequestDetailsRecord> {
    return this.prisma.purchaseRequest.update({
      where: { id },
      data,
      select: requestDetailsSelect,
    });
  }

  closeRequest(id: string): Promise<RequestDetailsRecord> {
    return this.prisma.$transaction(async (tx) => {
      await tx.offer.updateMany({
        where: { requestId: id, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });

      return tx.purchaseRequest.update({
        where: { id },
        data: { status: 'CLOSED', closedAt: new Date() },
        select: requestDetailsSelect,
      });
    });
  }

  findOffer(id: string): Promise<OfferRecord | null> {
    return this.prisma.offer.findUnique({ where: { id }, select: offerSelect });
  }

  async hasOffer(
    requestId: string,
    supplierCompanyId: string,
  ): Promise<boolean> {
    const count = await this.prisma.offer.count({
      where: { requestId, supplierCompanyId },
    });

    return count > 0;
  }

  async productBelongsTo(
    productId: string,
    companyId: string,
  ): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { id: productId, supplierCompanyId: companyId },
    });

    return count > 0;
  }

  async categoryExists(categoryId: string): Promise<boolean> {
    return (
      (await this.prisma.category.count({ where: { id: categoryId } })) > 0
    );
  }

  async cityExists(cityId: string): Promise<boolean> {
    return (await this.prisma.city.count({ where: { id: cityId } })) > 0;
  }

  createOffer(
    requestId: string,
    supplierCompanyId: string,
    data: OfferWriteData,
  ): Promise<OfferRecord> {
    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: { ...data, requestId, supplierCompanyId },
        select: offerSelect,
      });
      await tx.purchaseRequest.updateMany({
        where: { id: requestId, status: 'OPEN' },
        data: { status: 'OFFERS_RECEIVED' },
      });

      return offer;
    });
  }

  updateOffer(id: string, data: OfferWriteData): Promise<OfferRecord> {
    return this.prisma.offer.update({
      where: { id },
      data,
      select: offerSelect,
    });
  }

  acceptOffer(offerId: string, requestId: string): Promise<boolean> {
    return this.prisma
      .$transaction(async (tx) => {
        // Условные апдейты защищают от двойного принятия при параллельных запросах.
        const request = await tx.purchaseRequest.updateMany({
          where: { id: requestId, status: { in: ACTIVE_REQUEST_STATUSES } },
          data: { status: 'ACCEPTED', closedAt: new Date() },
        });
        const offer = await tx.offer.updateMany({
          where: { id: offerId, requestId, status: 'PENDING' },
          data: { status: 'ACCEPTED' },
        });

        if (request.count !== 1 || offer.count !== 1) {
          throw new StaleStateError();
        }

        await tx.offer.updateMany({
          where: { requestId, status: 'PENDING', id: { not: offerId } },
          data: { status: 'REJECTED' },
        });

        return true;
      })
      .catch((error: unknown) => {
        if (error instanceof StaleStateError) {
          return false;
        }

        throw error;
      });
  }

  async rejectOffer(offerId: string): Promise<boolean> {
    const result = await this.prisma.offer.updateMany({
      where: { id: offerId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    return result.count === 1;
  }

  listOffersBySupplier(companyId: string): Promise<SupplierOfferRecord[]> {
    return this.prisma.offer.findMany({
      where: { supplierCompanyId: companyId },
      select: supplierOfferSelect,
      orderBy: { createdAt: 'desc' },
    });
  }
}

class StaleStateError extends Error {}

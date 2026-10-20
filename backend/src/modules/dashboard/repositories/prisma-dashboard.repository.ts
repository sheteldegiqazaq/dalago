import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import type { DashboardRepository } from './dashboard.repository';
import type {
  ActivityItem,
  BuyerSummary,
  MarketplaceStats,
  SupplierSummary,
} from '../types/dashboard.type';

const ACTIVE = ['OPEN', 'OFFERS_RECEIVED'] as const;

/** Только чтение: агрегаты для кабинетов и витрины. Лента активности строится из реальных записей. */
@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async supplierSummary(companyId: string): Promise<SupplierSummary> {
    const [active, inactive, pending, accepted, inquiries, categories] =
      await Promise.all([
        this.prisma.product.count({
          where: { supplierCompanyId: companyId, status: 'ACTIVE' },
        }),
        this.prisma.product.count({
          where: { supplierCompanyId: companyId, status: 'INACTIVE' },
        }),
        this.prisma.offer.count({
          where: { supplierCompanyId: companyId, status: 'PENDING' },
        }),
        this.prisma.offer.count({
          where: { supplierCompanyId: companyId, status: 'ACCEPTED' },
        }),
        this.countInquiries(companyId),
        this.prisma.product.findMany({
          where: { supplierCompanyId: companyId, status: 'ACTIVE' },
          select: { categoryId: true },
          distinct: ['categoryId'],
        }),
      ]);

    // Входящие заявки: активные заявки в категориях моих товаров, на которые я ещё не ответил.
    const matching = await this.prisma.purchaseRequest.findMany({
      where: {
        status: { in: [...ACTIVE] },
        buyerCompanyId: { not: companyId },
        categoryId: { in: categories.map((c) => c.categoryId) },
        offers: { none: { supplierCompanyId: companyId } },
      },
      select: {
        id: true,
        title: true,
        quantity: true,
        unit: true,
        desiredDate: true,
        deliveryCityId: true,
        buyer: { select: { name: true } },
      },
      orderBy: { desiredDate: 'asc' },
      take: 5,
    });

    return {
      activeProducts: active,
      inactiveProducts: inactive,
      pendingOffers: pending,
      acceptedOffers: accepted,
      inquiries,
      matchingRequests: matching.map((r) => ({
        id: r.id,
        title: r.title,
        quantity: r.quantity.toNumber(),
        unit: r.unit,
        desiredDate: r.desiredDate,
        cityId: r.deliveryCityId,
        buyerName: r.buyer.name,
      })),
    };
  }

  async buyerSummary(companyId: string): Promise<BuyerSummary> {
    const [active, awaiting, pending, accepted, inquiries] = await Promise.all([
      this.prisma.purchaseRequest.count({
        where: { buyerCompanyId: companyId, status: { in: [...ACTIVE] } },
      }),
      this.prisma.purchaseRequest.count({
        where: { buyerCompanyId: companyId, status: 'OPEN' },
      }),
      this.prisma.offer.count({
        where: { status: 'PENDING', request: { buyerCompanyId: companyId } },
      }),
      this.prisma.purchaseRequest.count({
        where: { buyerCompanyId: companyId, status: 'ACCEPTED' },
      }),
      this.countInquiries(companyId),
    ]);

    return {
      activeRequests: active,
      awaitingFirstOffer: awaiting,
      pendingOffers: pending,
      acceptedRequests: accepted,
      inquiries,
    };
  }

  async supplierActivity(
    companyId: string,
    limit: number,
  ): Promise<ActivityItem[]> {
    const [offers, products, messages] = await Promise.all([
      this.prisma.offer.findMany({
        where: { supplierCompanyId: companyId },
        select: {
          status: true,
          updatedAt: true,
          request: {
            select: {
              id: true,
              title: true,
              buyer: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      this.prisma.product.findMany({
        where: { supplierCompanyId: companyId },
        select: { id: true, title: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      }),
      this.incomingMessages(companyId, limit),
    ]);

    return sortActivity(
      [
        ...offers.map((offer) => ({
          type:
            offer.status === 'ACCEPTED'
              ? ('OFFER_ACCEPTED' as const)
              : offer.status === 'REJECTED'
                ? ('OFFER_REJECTED' as const)
                : ('OFFER_SENT' as const),
          at: offer.updatedAt,
          title: offer.request.title,
          counterpart: offer.request.buyer.name,
          requestId: offer.request.id,
          productId: null,
          inquiryId: null,
        })),
        ...products.map((product) => ({
          type: 'PRODUCT_UPDATED' as const,
          at: product.updatedAt,
          title: product.title,
          counterpart: null,
          requestId: null,
          productId: product.id,
          inquiryId: null,
        })),
        ...messages,
      ],
      limit,
    );
  }

  async buyerActivity(
    companyId: string,
    limit: number,
  ): Promise<ActivityItem[]> {
    const [requests, offers, messages] = await Promise.all([
      this.prisma.purchaseRequest.findMany({
        where: { buyerCompanyId: companyId },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.offer.findMany({
        where: { request: { buyerCompanyId: companyId } },
        select: {
          status: true,
          createdAt: true,
          updatedAt: true,
          supplier: { select: { name: true } },
          request: { select: { id: true, title: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      this.incomingMessages(companyId, limit),
    ]);

    return sortActivity(
      [
        ...requests.map((request) => ({
          type: 'REQUEST_CREATED' as const,
          at: request.createdAt,
          title: request.title,
          counterpart: null,
          requestId: request.id,
          productId: null,
          inquiryId: null,
        })),
        ...offers.map((offer) => ({
          type:
            offer.status === 'ACCEPTED'
              ? ('OFFER_ACCEPTED' as const)
              : ('OFFER_RECEIVED' as const),
          at: offer.status === 'ACCEPTED' ? offer.updatedAt : offer.createdAt,
          title: offer.request.title,
          counterpart: offer.supplier.name,
          requestId: offer.request.id,
          productId: null,
          inquiryId: null,
        })),
        ...messages,
      ],
      limit,
    );
  }

  async marketplaceStats(): Promise<MarketplaceStats> {
    const [
      suppliers,
      buyers,
      products,
      requests,
      accepted,
      cities,
      realCompanies,
    ] = await Promise.all([
      this.prisma.company.count({ where: { owner: { role: 'SUPPLIER' } } }),
      this.prisma.company.count({ where: { owner: { role: 'BUYER' } } }),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.purchaseRequest.count({
        where: { status: { in: [...ACTIVE] } },
      }),
      this.prisma.purchaseRequest.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.company.findMany({
        where: { owner: { role: 'SUPPLIER' } },
        select: { cityId: true },
        distinct: ['cityId'],
      }),
      this.prisma.company.count({ where: { isDemo: false } }),
    ]);

    return {
      suppliers,
      buyers,
      activeProducts: products,
      activeRequests: requests,
      acceptedRequests: accepted,
      citiesWithSuppliers: cities.length,
      demoRecordsOnly: realCompanies === 0,
    };
  }

  private countInquiries(companyId: string) {
    return this.prisma.inquiry.count({
      where: { OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }] },
    });
  }

  private async incomingMessages(
    companyId: string,
    limit: number,
  ): Promise<ActivityItem[]> {
    const messages = await this.prisma.inquiryMessage.findMany({
      where: {
        inquiry: {
          OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
        },
        author: { company: { id: { not: companyId } } },
      },
      select: {
        createdAt: true,
        inquiry: { select: { id: true, subject: true } },
        author: { select: { company: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.map((message) => ({
      type: 'MESSAGE_RECEIVED' as const,
      at: message.createdAt,
      title: message.inquiry.subject,
      counterpart: message.author.company?.name ?? null,
      requestId: null,
      productId: null,
      inquiryId: message.inquiry.id,
    }));
  }
}

function sortActivity(items: ActivityItem[], limit: number): ActivityItem[] {
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

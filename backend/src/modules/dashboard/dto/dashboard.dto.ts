import { ApiProperty } from '@nestjs/swagger';

const ACTIVITY_TYPES = [
  'REQUEST_CREATED',
  'OFFER_RECEIVED',
  'OFFER_SENT',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'PRODUCT_UPDATED',
  'MESSAGE_RECEIVED',
] as const;

export class ActivityItemDto {
  @ApiProperty({ enum: ACTIVITY_TYPES })
  type!: (typeof ACTIVITY_TYPES)[number];

  @ApiProperty()
  at!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  counterpart!: string | null;

  @ApiProperty({ nullable: true, type: String })
  requestId!: string | null;

  @ApiProperty({ nullable: true, type: String })
  productId!: string | null;

  @ApiProperty({ nullable: true, type: String })
  inquiryId!: string | null;
}

export class MatchingRequestDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unit!: string;

  @ApiProperty()
  desiredDate!: string;

  @ApiProperty()
  cityId!: string;

  @ApiProperty()
  buyerName!: string;
}

export class SupplierSummaryDto {
  @ApiProperty()
  activeProducts!: number;

  @ApiProperty()
  inactiveProducts!: number;

  @ApiProperty()
  pendingOffers!: number;

  @ApiProperty()
  acceptedOffers!: number;

  @ApiProperty()
  inquiries!: number;

  @ApiProperty({
    type: [MatchingRequestDto],
    description: 'Заявки в категориях моих товаров',
  })
  matchingRequests!: MatchingRequestDto[];
}

export class BuyerSummaryDto {
  @ApiProperty()
  activeRequests!: number;

  @ApiProperty()
  awaitingFirstOffer!: number;

  @ApiProperty()
  pendingOffers!: number;

  @ApiProperty()
  acceptedRequests!: number;

  @ApiProperty()
  inquiries!: number;
}

export class DashboardDto {
  @ApiProperty({ enum: ['BUYER', 'SUPPLIER'] })
  role!: 'BUYER' | 'SUPPLIER';

  @ApiProperty({ type: SupplierSummaryDto, nullable: true })
  supplier!: SupplierSummaryDto | null;

  @ApiProperty({ type: BuyerSummaryDto, nullable: true })
  buyer!: BuyerSummaryDto | null;

  @ApiProperty({ type: [ActivityItemDto] })
  activity!: ActivityItemDto[];
}

export class MarketplaceStatsDto {
  @ApiProperty()
  suppliers!: number;

  @ApiProperty()
  buyers!: number;

  @ApiProperty()
  activeProducts!: number;

  @ApiProperty()
  activeRequests!: number;

  @ApiProperty()
  acceptedRequests!: number;

  @ApiProperty()
  citiesWithSuppliers!: number;

  @ApiProperty({ description: 'В базе только демонстрационные компании' })
  demoRecordsOnly!: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { UNITS } from './request-input.dto';

export const REQUEST_STATUSES = [
  'OPEN',
  'OFFERS_RECEIVED',
  'ACCEPTED',
  'CLOSED',
] as const;
export const OFFER_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;

export class PlaceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameRu!: string;

  @ApiProperty()
  nameKk!: string;
}

export class RequestCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  nameRu!: string;

  @ApiProperty()
  nameKk!: string;

  @ApiProperty()
  icon!: string;
}

export class CompanyRefDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;
}

export class BuyerRefDto extends CompanyRefDto {
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Только участникам заявки',
  })
  phone!: string | null;
}

export class RequestListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ enum: UNITS })
  unit!: (typeof UNITS)[number];

  @ApiProperty({ nullable: true, type: Number })
  targetPrice!: number | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  desiredDate!: string;

  @ApiProperty({ nullable: true, type: String })
  deliveryAddress!: string | null;

  @ApiProperty({ enum: REQUEST_STATUSES })
  status!: (typeof REQUEST_STATUSES)[number];

  @ApiProperty()
  isSample!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  offerCount!: number;

  @ApiProperty({ type: PlaceDto })
  deliveryCity!: PlaceDto;

  @ApiProperty({ type: RequestCategoryDto, nullable: true })
  category!: RequestCategoryDto | null;

  @ApiProperty({ type: BuyerRefDto })
  buyer!: BuyerRefDto;
}

export class OfferSupplierDto extends CompanyRefDto {
  @ApiProperty()
  phone!: string;

  @ApiProperty({ type: PlaceDto })
  city!: PlaceDto;
}

export class OfferProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  titleKk!: string | null;
}

export class OfferDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  pricePerUnit!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ nullable: true, type: Number })
  deliveryCost!: number | null;

  @ApiProperty({ description: 'quantity × pricePerUnit + доставка' })
  totalCost!: number;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  estimatedDeliveryDate!: string;

  @ApiProperty({ nullable: true, type: String })
  terms!: string | null;

  @ApiProperty({ enum: OFFER_STATUSES })
  status!: (typeof OFFER_STATUSES)[number];

  @ApiProperty()
  isSample!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: OfferSupplierDto })
  supplier!: OfferSupplierDto;

  @ApiProperty({ type: OfferProductDto, nullable: true })
  product!: OfferProductDto | null;
}

export class RequestViewerDto {
  @ApiProperty()
  isOwner!: boolean;

  @ApiProperty({ nullable: true, type: String })
  myOfferId!: string | null;

  @ApiProperty({ description: 'Текущий поставщик может отправить предложение' })
  canOffer!: boolean;
}

export class RequestDetailsDto extends RequestListItemDto {
  @ApiProperty({ type: [OfferDto] })
  offers!: OfferDto[];

  @ApiProperty({ type: RequestViewerDto })
  viewer!: RequestViewerDto;
}

export class RequestPageDto {
  @ApiProperty({ type: [RequestListItemDto] })
  items!: RequestListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class OfferRequestRefDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: REQUEST_STATUSES })
  status!: (typeof REQUEST_STATUSES)[number];

  @ApiProperty({ enum: UNITS })
  unit!: (typeof UNITS)[number];

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  desiredDate!: string;

  @ApiProperty({ type: PlaceDto })
  deliveryCity!: PlaceDto;

  @ApiProperty({ type: CompanyRefDto })
  buyer!: CompanyRefDto;
}

export class SupplierOfferDto extends OfferDto {
  @ApiProperty({ type: OfferRequestRefDto })
  request!: OfferRequestRefDto;
}

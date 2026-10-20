import { ApiProperty } from '@nestjs/swagger';
import { UNITS } from './product-input.dto';

export class NamedPlaceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameRu!: string;

  @ApiProperty()
  nameKk!: string;
}

export class ProductCategoryDto {
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

export class ProductSupplierDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;
}

export class ProductListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  titleKk!: string | null;

  @ApiProperty({ description: 'Цена за единицу, тг' })
  price!: number;

  @ApiProperty({ example: 'KZT' })
  currency!: string;

  @ApiProperty({ enum: UNITS })
  unit!: (typeof UNITS)[number];

  @ApiProperty()
  availableQty!: number;

  @ApiProperty()
  minOrderQty!: number;

  @ApiProperty()
  deliveryAvailable!: boolean;

  @ApiProperty()
  pickupAvailable!: boolean;

  @ApiProperty({ nullable: true, type: String })
  imageUrl!: string | null;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  status!: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ description: 'Пример данных из сида' })
  isSample!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: NamedPlaceDto })
  city!: NamedPlaceDto;

  @ApiProperty({ type: ProductCategoryDto })
  category!: ProductCategoryDto;

  @ApiProperty({ type: ProductSupplierDto })
  supplier!: ProductSupplierDto;
}

export class ProductSupplierDetailsDto extends ProductSupplierDto {
  @ApiProperty()
  phone!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  isSample!: boolean;

  @ApiProperty({ type: NamedPlaceDto })
  city!: NamedPlaceDto;
}

export class ProductDetailsDto extends ProductListItemDto {
  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true, type: String })
  descriptionKk!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ type: ProductSupplierDetailsDto })
  declare supplier: ProductSupplierDetailsDto;

  @ApiProperty({ description: 'Просматривает владелец объявления' })
  isOwner!: boolean;
}

export class ProductPageDto {
  @ApiProperty({ type: [ProductListItemDto] })
  items!: ProductListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

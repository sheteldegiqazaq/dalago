import { ApiProperty } from '@nestjs/swagger';

/**
 * Контракт карточек в ответе ИИ-поиска. Повторяет схему ProductListItemDto
 * модуля products: модуль не импортирует чужие DTO, форма данных одна и та же.
 */
class AiPlaceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameRu!: string;

  @ApiProperty()
  nameKk!: string;
}

class AiCategoryDto extends AiPlaceDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  icon!: string;
}

class AiSupplierDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;
}

export class AiProductItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  titleKk!: string | null;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: ['KG', 'T', 'L', 'PCS', 'PACK'] })
  unit!: 'KG' | 'T' | 'L' | 'PCS' | 'PACK';

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

  @ApiProperty()
  isSample!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: AiPlaceDto })
  city!: AiPlaceDto;

  @ApiProperty({ type: AiCategoryDto })
  category!: AiCategoryDto;

  @ApiProperty({ type: AiSupplierDto })
  supplier!: AiSupplierDto;
}

export class ProductPageDto {
  @ApiProperty({ type: [AiProductItemDto] })
  items!: AiProductItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export const UNITS = ['KG', 'T', 'L', 'PCS', 'PACK'] as const;

export class RequestInputDto {
  @ApiProperty({ example: 'Картофель для кафе, 300 кг' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  categoryId?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiProperty({ example: 300 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(10_000_000)
  quantity!: number;

  @ApiProperty({ enum: UNITS })
  @IsIn(UNITS)
  unit!: (typeof UNITS)[number];

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
    description: 'Желаемая цена за единицу, тг',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  targetPrice?: number | null;

  @ApiProperty({ example: 'semey' })
  @IsString()
  @MaxLength(40)
  deliveryCityId!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deliveryAddress?: string | null;

  @ApiProperty({ example: '2026-11-01', description: 'Желаемая дата поставки' })
  @IsDateString()
  desiredDate!: string;
}

export class OfferInputDto {
  @ApiProperty({ example: 300 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(10_000_000)
  quantity!: number;

  @ApiProperty({ example: 140, description: 'Цена за единицу, тг' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(100_000_000)
  pricePerUnit!: number;

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
    description: 'Стоимость доставки, тг',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Max(100_000_000)
  deliveryCost?: number | null;

  @ApiProperty({ example: '2026-10-25' })
  @IsDateString()
  estimatedDeliveryDate!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  terms?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'Своё объявление, если есть',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  productId?: string | null;
}

export class RequestQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ description: 'slug категории' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  city?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(50)
  limit?: number;
}

export const REQUEST_STATUS_FILTERS = [
  'ACTIVE',
  'OPEN',
  'OFFERS_RECEIVED',
  'ACCEPTED',
  'CLOSED',
] as const;

export class MyRequestsQueryDto {
  @ApiPropertyOptional({ enum: REQUEST_STATUS_FILTERS })
  @IsOptional()
  @IsIn(REQUEST_STATUS_FILTERS)
  status?: (typeof REQUEST_STATUS_FILTERS)[number];
}

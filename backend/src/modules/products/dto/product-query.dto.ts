import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { UNITS } from './product-input.dto';

export const PRODUCT_SORTS = [
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
] as const;

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Поиск по названию (ru/kk), описанию и тегам',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ example: 'vegetables', description: 'slug категории' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @ApiPropertyOptional({ example: 'semey' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  city?: string;

  @ApiPropertyOptional({ example: 'abai' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  region?: string;

  @ApiPropertyOptional({ description: 'Минимальная цена за единицу, тг' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Максимальная цена за единицу, тг' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Нужный объём: показываем товары, которые его покрывают',
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  quantity?: number;

  @ApiPropertyOptional({ enum: UNITS, description: 'Единица для quantity' })
  @IsOptional()
  @IsIn(UNITS)
  unit?: (typeof UNITS)[number];

  @ApiPropertyOptional({ description: 'Только с доставкой' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  delivery?: boolean;

  @ApiPropertyOptional({ description: 'Товары конкретного поставщика' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  supplierId?: string;

  @ApiPropertyOptional({ enum: PRODUCT_SORTS, default: 'relevance' })
  @IsOptional()
  @IsIn(PRODUCT_SORTS)
  sort?: (typeof PRODUCT_SORTS)[number];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const UNITS = ['KG', 'T', 'L', 'PCS', 'PACK'] as const;

export class ProductInputDto {
  @ApiProperty()
  @IsString()
  @MaxLength(40)
  categoryId!: string;

  @ApiProperty({ example: 'Картофель «Гала», урожай 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: 'Картоп «Гала»',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titleKk?: string | null;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionKk?: string | null;

  @ApiProperty({ example: 150, description: 'Цена за единицу, тг' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(100_000_000)
  price!: number;

  @ApiProperty({ enum: UNITS })
  @IsIn(UNITS)
  unit!: (typeof UNITS)[number];

  @ApiProperty({ example: 2000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  availableQty!: number;

  @ApiProperty({ example: 100 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(10_000_000)
  minOrderQty!: number;

  @ApiProperty({ example: 'semey' })
  @IsString()
  @MaxLength(40)
  cityId!: string;

  @ApiProperty()
  @IsBoolean()
  deliveryAvailable!: boolean;

  @ApiProperty()
  @IsBoolean()
  pickupAvailable!: boolean;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  @MaxLength(500)
  imageUrl?: string | null;

  @ApiProperty({ type: [String], example: ['картошка', 'гала'] })
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags!: string[];
}

export class ProductStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsIn(['ACTIVE', 'INACTIVE'])
  status!: 'ACTIVE' | 'INACTIVE';
}

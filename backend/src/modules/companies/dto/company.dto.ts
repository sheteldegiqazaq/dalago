import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const SUPPLIER_TYPES = ['FARM', 'PRODUCER', 'PROCESSOR', 'WHOLESALE'] as const;

export class SupplierQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  city?: string;

  @ApiPropertyOptional({ description: 'slug категории' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @ApiPropertyOptional({ enum: SUPPLIER_TYPES })
  @IsOptional()
  @IsIn(SUPPLIER_TYPES)
  type?: (typeof SUPPLIER_TYPES)[number];

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

export class CompanyProfileInputDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty()
  @IsString()
  @MaxLength(40)
  cityId!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiProperty()
  @IsString()
  @Matches(/^[+\d][\d\s()-]{5,20}$/, { message: 'INVALID_PHONE' })
  phone!: string;
}

export class SupplierCategoryDto {
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

export class SupplierCityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameRu!: string;

  @ApiProperty()
  nameKk!: string;

  @ApiProperty()
  regionId!: string;
}

export class SupplierDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ nullable: true, type: String })
  address!: string | null;

  @ApiProperty()
  phone!: string;

  @ApiProperty({ description: 'Демонстрационная запись' })
  isDemo!: boolean;

  @ApiProperty({ description: 'Дата регистрации на платформе' })
  createdAt!: string;

  @ApiProperty({ type: SupplierCityDto })
  city!: SupplierCityDto;

  @ApiProperty()
  productCount!: number;

  @ApiProperty({ type: [SupplierCategoryDto] })
  categories!: SupplierCategoryDto[];
}

export class SupplierPageDto {
  @ApiProperty({ type: [SupplierDto] })
  items!: SupplierDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class CityStatsDto {
  @ApiProperty()
  cityId!: string;

  @ApiProperty()
  suppliers!: number;

  @ApiProperty()
  products!: number;
}

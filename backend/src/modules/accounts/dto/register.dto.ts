import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const COMPANY_TYPES = [
  'FARM',
  'PRODUCER',
  'PROCESSOR',
  'SHOP',
  'CAFE',
  'RESTAURANT',
  'CANTEEN',
  'WHOLESALE',
] as const;

export class CompanyInputDto {
  @ApiProperty({ example: 'Ертіс бақшасы' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: COMPANY_TYPES, example: 'FARM' })
  @IsIn(COMPANY_TYPES)
  type!: (typeof COMPANY_TYPES)[number];

  @ApiProperty({ example: 'semey' })
  @IsString()
  @MaxLength(40)
  cityId!: string;

  @ApiProperty({ example: '+7 700 123 45 67' })
  @IsString()
  @Matches(/^[+\d][\d\s()-]{5,20}$/, { message: 'INVALID_PHONE' })
  phone!: string;

  @ApiPropertyOptional({ example: 'Выращиваем овощи под Семеем' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'farmer@example.kz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'secret123' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiProperty({ example: 'Айгерім Нұрланқызы' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: ['BUYER', 'SUPPLIER'] })
  @IsIn(['BUYER', 'SUPPLIER'])
  role!: 'BUYER' | 'SUPPLIER';

  @ApiProperty({ enum: ['kk', 'ru'], example: 'kk' })
  @IsIn(['kk', 'ru'])
  preferredLanguage!: 'kk' | 'ru';

  @ApiProperty({ type: CompanyInputDto })
  @ValidateNested()
  @Type(() => CompanyInputDto)
  company!: CompanyInputDto;
}

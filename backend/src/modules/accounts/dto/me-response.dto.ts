import { ApiProperty } from '@nestjs/swagger';
import { COMPANY_TYPES } from './register.dto';

export class MyCompanyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: COMPANY_TYPES })
  type!: (typeof COMPANY_TYPES)[number];

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  cityId!: string;

  @ApiProperty({ nullable: true, type: String })
  address!: string | null;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  isSample!: boolean;
}

export class MeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['BUYER', 'SUPPLIER', 'ADMIN'] })
  role!: 'BUYER' | 'SUPPLIER' | 'ADMIN';

  @ApiProperty({ enum: ['kk', 'ru'] })
  preferredLanguage!: 'kk' | 'ru';

  @ApiProperty({ type: MyCompanyDto, nullable: true })
  company!: MyCompanyDto | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token (Bearer)' })
  accessToken!: string;

  @ApiProperty({ type: MeResponseDto })
  user!: MeResponseDto;
}

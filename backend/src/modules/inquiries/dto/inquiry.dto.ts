import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class StartInquiryDto {
  @ApiProperty({ description: 'Компания-получатель' })
  @IsString()
  @MaxLength(40)
  toCompanyId!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  productId?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  requestId?: string | null;

  @ApiProperty({ example: 'Вопрос по картофелю' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}

export class PostMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}

export class InquiryCompanyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;
}

export class InquiryLinkDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  titleKk?: string | null;
}

export class InquiryListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty({
    type: InquiryCompanyDto,
    description: 'Вторая сторона переписки',
  })
  counterpart!: InquiryCompanyDto;

  @ApiProperty({ type: InquiryLinkDto, nullable: true })
  product!: InquiryLinkDto | null;

  @ApiProperty({ type: InquiryLinkDto, nullable: true })
  request!: InquiryLinkDto | null;

  @ApiProperty({ nullable: true, type: String })
  lastMessage!: string | null;

  @ApiProperty({ description: 'Последнее сообщение от другой стороны' })
  lastFromCounterpart!: boolean;

  @ApiProperty()
  messageCount!: number;

  @ApiProperty()
  isDemo!: boolean;

  @ApiProperty()
  updatedAt!: string;
}

export class InquiryMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty()
  authorName!: string;

  @ApiProperty({
    description: 'Сообщение написал текущий пользователь (его компания)',
  })
  mine!: boolean;

  @ApiProperty()
  createdAt!: string;
}

export class InquiryCounterpartDto extends InquiryCompanyDto {
  @ApiProperty()
  phone!: string;
}

export class InquiryDetailsDto extends InquiryListItemDto {
  @ApiProperty({ type: InquiryCounterpartDto })
  declare counterpart: InquiryCounterpartDto;

  @ApiProperty({ type: [InquiryMessageDto] })
  messages!: InquiryMessageDto[];
}

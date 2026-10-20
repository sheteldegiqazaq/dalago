import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ProductPageDto } from './product-page.dto';

const UNITS = ['KG', 'T', 'L', 'PCS', 'PACK'] as const;
const MODES = ['claude', 'rules'] as const;
const NOTICES = ['AI_NOT_CONFIGURED', 'AI_UNAVAILABLE_FALLBACK'] as const;

export class ListingDraftRequestDto {
  @ApiProperty({
    example: 'продаю 2 тонны картошки, 150 тг за кило, Семей, доставка своя',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  text!: string;
}

export class AiSearchRequestDto {
  @ApiProperty({
    example: 'нужно 50 кг свежей говядины для кафе в Семее до пятницы',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  query!: string;
}

export class ListingDraftDto {
  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: String })
  titleKk!: string | null;

  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true, type: String })
  descriptionKk!: string | null;

  @ApiProperty({ nullable: true, type: String })
  categorySlug!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  quantity!: number | null;

  @ApiProperty({ nullable: true, enum: UNITS })
  unit!: (typeof UNITS)[number] | null;

  @ApiProperty({ nullable: true, type: Number })
  price!: number | null;

  @ApiProperty({ nullable: true, type: String })
  cityId!: string | null;

  @ApiProperty({ nullable: true, type: Boolean })
  deliveryAvailable!: boolean | null;

  @ApiProperty({ nullable: true, type: Boolean })
  pickupAvailable!: boolean | null;

  @ApiProperty({ type: [String] })
  tags!: string[];
}

export class ListingDraftResponseDto {
  @ApiProperty({
    enum: MODES,
    description: 'claude — ответила модель; rules — резервный режим',
  })
  mode!: (typeof MODES)[number];

  @ApiProperty({ enum: NOTICES, nullable: true })
  notice!: (typeof NOTICES)[number] | null;

  @ApiProperty({ type: ListingDraftDto })
  draft!: ListingDraftDto;

  @ApiProperty({
    type: [String],
    description: 'Поля, которых не было в тексте',
  })
  missingFields!: string[];
}

export class SearchIntentDto {
  @ApiProperty({ type: [String] })
  keywords!: string[];

  @ApiProperty({ nullable: true, type: String })
  categorySlug!: string | null;

  @ApiProperty({ nullable: true, type: String })
  cityId!: string | null;

  @ApiProperty({ nullable: true, type: String })
  regionId!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  minPrice!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  maxPrice!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  quantity!: number | null;

  @ApiProperty({ nullable: true, enum: UNITS })
  unit!: (typeof UNITS)[number] | null;

  @ApiProperty()
  deliveryRequired!: boolean;

  @ApiProperty({ nullable: true, type: String })
  neededBy!: string | null;
}

export class AiSearchResponseDto extends ProductPageDto {
  @ApiProperty({ enum: MODES })
  mode!: (typeof MODES)[number];

  @ApiProperty({ enum: NOTICES, nullable: true })
  notice!: (typeof NOTICES)[number] | null;

  @ApiProperty({ type: SearchIntentDto })
  intent!: SearchIntentDto;

  @ApiProperty({
    description: 'Точных совпадений нет, показаны похожие товары',
  })
  relaxed!: boolean;
}

export class AiStatusDto {
  @ApiProperty({ enum: MODES })
  mode!: (typeof MODES)[number];

  @ApiProperty({ nullable: true, type: String })
  model!: string | null;
}

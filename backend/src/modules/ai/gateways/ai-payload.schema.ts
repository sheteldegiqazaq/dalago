import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const UNITS = ['KG', 'T', 'L', 'PCS', 'PACK'] as const;

/** Ответ модели проверяется так же строго, как пользовательский ввод. */
export class ListingDraftPayload {
  @IsString()
  @MaxLength(120)
  title!: string;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(120)
  titleKk!: string | null;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(2000)
  descriptionKk!: string | null;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  categorySlug!: string | null;

  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number | null;

  @ValidateIf((_, v) => v !== null)
  @IsIn(UNITS)
  unit!: (typeof UNITS)[number] | null;

  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number | null;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  cityId!: string | null;

  @ValidateIf((_, v) => v !== null)
  @IsBoolean()
  deliveryAvailable!: boolean | null;

  @ValidateIf((_, v) => v !== null)
  @IsBoolean()
  pickupAvailable!: boolean | null;

  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  tags!: string[];
}

export class SearchIntentPayload {
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  keywords!: string[];

  @ValidateIf((_, v) => v !== null)
  @IsString()
  categorySlug!: string | null;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  cityId!: string | null;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  regionId!: string | null;

  @ValidateIf((_, v) => v !== null)
  @IsNumber()
  @Min(0)
  minPrice!: number | null;

  @ValidateIf((_, v) => v !== null)
  @IsNumber()
  @Min(0)
  maxPrice!: number | null;

  @ValidateIf((_, v) => v !== null)
  @IsNumber()
  @Min(0)
  quantity!: number | null;

  @ValidateIf((_, v) => v !== null)
  @IsIn(UNITS)
  unit!: (typeof UNITS)[number] | null;

  @IsBoolean()
  deliveryRequired!: boolean;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  neededBy!: string | null;
}

const nullable = (type: string) => ({ type: [type, 'null'] });
const unitSchema = { type: ['string', 'null'], enum: [...UNITS, null] };

export const LISTING_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'titleKk',
    'description',
    'descriptionKk',
    'categorySlug',
    'quantity',
    'unit',
    'price',
    'cityId',
    'deliveryAvailable',
    'pickupAvailable',
    'tags',
  ],
  properties: {
    title: { type: 'string', description: 'Короткое название на русском' },
    titleKk: {
      ...nullable('string'),
      description: 'То же название на казахском',
    },
    description: { type: 'string' },
    descriptionKk: nullable('string'),
    categorySlug: nullable('string'),
    quantity: nullable('number'),
    unit: unitSchema,
    price: {
      ...nullable('number'),
      description: 'Цена за единицу в тенге, только если названа',
    },
    cityId: nullable('string'),
    deliveryAvailable: nullable('boolean'),
    pickupAvailable: nullable('boolean'),
    tags: { type: 'array', items: { type: 'string' } },
  },
} as const;

export const SEARCH_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'keywords',
    'categorySlug',
    'cityId',
    'regionId',
    'minPrice',
    'maxPrice',
    'quantity',
    'unit',
    'deliveryRequired',
    'neededBy',
  ],
  properties: {
    keywords: { type: 'array', items: { type: 'string' } },
    categorySlug: nullable('string'),
    cityId: nullable('string'),
    regionId: nullable('string'),
    minPrice: nullable('number'),
    maxPrice: nullable('number'),
    quantity: nullable('number'),
    unit: unitSchema,
    deliveryRequired: { type: 'boolean' },
    neededBy: { ...nullable('string'), description: 'YYYY-MM-DD' },
  },
} as const;

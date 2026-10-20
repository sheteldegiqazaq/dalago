import { ApiProperty } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({ example: 'semey' })
  id!: string;

  @ApiProperty({ example: 'abai' })
  regionId!: string;

  @ApiProperty({ example: 'Семей' })
  nameRu!: string;

  @ApiProperty({ example: 'Семей' })
  nameKk!: string;

  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Приблизительный центр населённого пункта',
  })
  latitude!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  longitude!: number | null;
}

export class RegionDto {
  @ApiProperty({ example: 'abai' })
  id!: string;

  @ApiProperty({ example: 'Абайская область' })
  nameRu!: string;

  @ApiProperty({ example: 'Абай облысы' })
  nameKk!: string;

  @ApiProperty({ description: 'Работает ли платформа в регионе (пилот)' })
  isActive!: boolean;

  @ApiProperty({ type: [CityDto] })
  cities!: CityDto[];
}

export class CategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'vegetables' })
  slug!: string;

  @ApiProperty({ example: 'Овощи' })
  nameRu!: string;

  @ApiProperty({ example: 'Көкөністер' })
  nameKk!: string;

  @ApiProperty({ example: 'carrot', description: 'Ключ иконки на фронтенде' })
  icon!: string;
}

export class ReferenceResponseDto {
  @ApiProperty({ type: [RegionDto] })
  regions!: RegionDto[];

  @ApiProperty({ type: [CategoryDto] })
  categories!: CategoryDto[];
}

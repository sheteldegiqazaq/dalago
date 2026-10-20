import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReferenceResponseDto } from '../dto/reference-response.dto';
import { GetReferenceUseCase } from '../use-cases/get-reference.use-case';

@ApiTags('Справочники')
@Controller('reference')
export class ReferenceController {
  constructor(private readonly getReference: GetReferenceUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Регионы, города и категории товаров' })
  @ApiOkResponse({ type: ReferenceResponseDto })
  async get(): Promise<ReferenceResponseDto> {
    const { regions, categories } = await this.getReference.execute();

    return {
      regions: regions.map((region) => ({
        id: region.id,
        nameRu: region.nameRu,
        nameKk: region.nameKk,
        isActive: region.isActive,
        cities: region.cities.map((city) => ({
          id: city.id,
          regionId: city.regionId,
          nameRu: city.nameRu,
          nameKk: city.nameKk,
          latitude: city.latitude,
          longitude: city.longitude,
        })),
      })),
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        nameRu: category.nameRu,
        nameKk: category.nameKk,
        icon: category.icon,
      })),
    };
  }
}

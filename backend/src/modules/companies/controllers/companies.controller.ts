import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import {
  CityStatsDto,
  CompanyProfileInputDto,
  SupplierDto,
  SupplierPageDto,
  SupplierQueryDto,
} from '../dto/company.dto';
import { SupplierMapper } from '../mappers/supplier.mapper';
import { GetCityStatsUseCase } from '../use-cases/get-city-stats.use-case';
import { GetSupplierUseCase } from '../use-cases/get-supplier.use-case';
import { ListSuppliersUseCase } from '../use-cases/list-suppliers.use-case';
import { UpdateMyCompanyUseCase } from '../use-cases/update-my-company.use-case';

@ApiTags('Компании и поставщики')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly listSuppliers: ListSuppliersUseCase,
    private readonly getSupplier: GetSupplierUseCase,
    private readonly getCityStats: GetCityStatsUseCase,
    private readonly updateMyCompany: UpdateMyCompanyUseCase,
  ) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'Каталог поставщиков' })
  @ApiOkResponse({ type: SupplierPageDto })
  async suppliers(@Query() query: SupplierQueryDto): Promise<SupplierPageDto> {
    const page = await this.listSuppliers.execute({
      q: query.q,
      cityId: query.city,
      categorySlug: query.category,
      type: query.type,
      page: query.page ?? 1,
      limit: query.limit ?? 12,
    });

    return { ...page, items: page.items.map((c) => SupplierMapper.toHttp(c)) };
  }

  @Get('stats/cities')
  @ApiOperation({
    summary: 'Поставщики и товары по населённым пунктам (для карты)',
  })
  @ApiOkResponse({ type: [CityStatsDto] })
  cityStats(): Promise<CityStatsDto[]> {
    return this.getCityStats.execute();
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Профиль поставщика' })
  @ApiOkResponse({ type: SupplierDto })
  async supplier(@Param('id') id: string): Promise<SupplierDto> {
    return SupplierMapper.toHttp(await this.getSupplier.execute(id));
  }

  @Patch('me')
  @Authorization()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Изменить профиль своей компании' })
  @ApiOkResponse({ type: SupplierDto })
  async updateMine(
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: CompanyProfileInputDto,
  ): Promise<SupplierDto> {
    const company = await this.updateMyCompany.execute(companyId, {
      name: dto.name,
      description: dto.description ?? null,
      cityId: dto.cityId,
      address: dto.address ?? null,
      phone: dto.phone,
    });

    return SupplierMapper.toHttp(company);
  }
}

import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import type { AuthenticatedUser } from '@shared/types/authenticated-user';
import { DashboardDto, MarketplaceStatsDto } from '../dto/dashboard.dto';
import { GetDashboardUseCase } from '../use-cases/get-dashboard.use-case';
import { GetMarketplaceStatsUseCase } from '../use-cases/get-marketplace-stats.use-case';

@ApiTags('Кабинет')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboard: GetDashboardUseCase,
    private readonly getStats: GetMarketplaceStatsUseCase,
  ) {}

  @Get()
  @Authorization()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Сводка кабинета покупателя или поставщика' })
  @ApiOkResponse({ type: DashboardDto })
  async get(@Authorized() user: AuthenticatedUser): Promise<DashboardDto> {
    const result = await this.getDashboard.execute(user.role, user.companyId);

    return {
      role: result.role,
      buyer: result.buyer,
      supplier: result.supplier && {
        ...result.supplier,
        matchingRequests: result.supplier.matchingRequests.map((r) => ({
          ...r,
          desiredDate: r.desiredDate.toISOString().slice(0, 10),
        })),
      },
      activity: result.activity.map((item) => ({
        ...item,
        at: item.at.toISOString(),
      })),
    };
  }

  @Get('marketplace-stats')
  @ApiOperation({
    summary: 'Показатели платформы (из базы, не официальная статистика)',
  })
  @ApiOkResponse({ type: MarketplaceStatsDto })
  stats(): Promise<MarketplaceStatsDto> {
    return this.getStats.execute();
  }
}

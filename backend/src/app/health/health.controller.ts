import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthResponseDto, ReadinessResponseDto } from './health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Здоровье приложения')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Проверить доступность приложения' })
  @ApiOkResponse({ type: HealthResponseDto })
  check(): HealthResponseDto {
    return this.live();
  }

  @Get('live')
  @ApiOperation({ summary: 'Проверить, что процесс приложения запущен' })
  @ApiOkResponse({ type: HealthResponseDto })
  live(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверить готовность приложения к трафику' })
  @ApiOkResponse({ type: ReadinessResponseDto })
  @ApiServiceUnavailableResponse({ type: ReadinessResponseDto })
  async ready(): Promise<ReadinessResponseDto> {
    const readiness = await this.health.getReadiness();

    if (readiness.status === 'error') {
      throw new HttpException(readiness, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return readiness;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_INDICATORS, type HealthIndicator } from './health-indicator';
import type {
  HealthDependencyDto,
  ReadinessResponseDto,
} from './health-response.dto';

@Injectable()
export class HealthService {
  constructor(
    @Inject(HEALTH_INDICATORS)
    private readonly indicators: HealthIndicator[],
  ) {}

  async getReadiness(): Promise<ReadinessResponseDto> {
    const checks = await Promise.all(
      this.indicators.map((indicator) => this.check(indicator)),
    );
    const dependencies = Object.fromEntries(checks) as Record<
      string,
      HealthDependencyDto
    >;
    const isReady = Object.values(dependencies).every(
      (dependency) => dependency.status === 'ok',
    );

    return {
      status: isReady ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      dependencies,
    };
  }

  private async check(
    indicator: HealthIndicator,
  ): Promise<[string, HealthDependencyDto]> {
    try {
      await indicator.check();
      return [indicator.name, { status: 'ok' }];
    } catch {
      return [indicator.name, { status: 'error' }];
    }
  }
}

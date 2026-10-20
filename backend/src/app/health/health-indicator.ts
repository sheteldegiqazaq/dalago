export interface HealthIndicator {
  name: string;
  check(): Promise<void>;
}

export const HEALTH_INDICATORS = Symbol('HEALTH_INDICATORS');

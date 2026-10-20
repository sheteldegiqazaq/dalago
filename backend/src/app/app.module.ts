import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { aiConfig } from './config/ai-config';
import { appConfig } from './config/app-config';
import { corsConfig } from './config/cors-config';
import { validateEnv } from './config/env.validation';
import { openapiConfig } from './config/openapi-config';
import { seedConfig } from './config/seed-config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { AccountsModule } from '../modules/accounts';
import { AiModule } from '../modules/ai';
import { CompaniesModule } from '../modules/companies';
import { DashboardModule } from '../modules/dashboard';
import { InquiriesModule } from '../modules/inquiries';
import { ProcurementModule } from '../modules/procurement';
import { ProductsModule } from '../modules/products';
import { ReferenceModule } from '../modules/reference';
import { UsersModule } from '../modules/users';
import { HealthService } from './health/health.service';
import {
  HEALTH_INDICATORS,
  type HealthIndicator,
} from './health/health-indicator';
import { DatabaseHealthIndicator } from './health/indicators/database-health.indicator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, aiConfig, corsConfig, openapiConfig, seedConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    ReferenceModule,
    CompaniesModule,
    ProductsModule,
    ProcurementModule,
    InquiriesModule,
    DashboardModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    {
      provide: HEALTH_INDICATORS,
      useFactory: (database: DatabaseHealthIndicator): HealthIndicator[] => [
        database,
      ],
      inject: [DatabaseHealthIndicator],
    },
  ],
})
export class AppModule {}

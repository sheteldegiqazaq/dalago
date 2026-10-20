import { plainToInstance, Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: 'development' | 'test' | 'production' = 'development';

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  PORT = 3000;

  @IsString()
  @IsNotEmpty()
  API_PREFIX = 'api';

  @IsString()
  @IsNotEmpty()
  ALLOWED_ORIGIN = 'http://localhost:3000';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(60)
  JWT_EXPIRES_IN_SECONDS = 604800;

  @IsOptional()
  @IsString()
  ANTHROPIC_API_KEY?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  AI_RATE_LIMIT_PER_MINUTE = 15;

  @IsString()
  @IsNotEmpty()
  ANTHROPIC_MODEL = 'claude-sonnet-5-5';

  @IsString()
  @IsNotEmpty()
  OPENAPI_TITLE = 'Документация DalaGo API';

  @IsString()
  @IsNotEmpty()
  OPENAPI_VERSION = '0.1';

  @IsString()
  @IsNotEmpty()
  OPENAPI_OUTPUT_PATH = './uploads/openapi';

  @IsBooleanString()
  SEED_ON_BOOT = 'false';

  @IsBooleanString()
  SEED_ALLOW_PRODUCTION = 'false';

  @IsString()
  @IsNotEmpty()
  SEED_ADMIN_EMAIL = 'admin@example.com';

  @IsString()
  @IsNotEmpty()
  SEED_ADMIN_NAME = 'Admin';
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

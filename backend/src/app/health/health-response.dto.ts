import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Текущий статус приложения.',
    example: 'ok',
  })
  status!: 'ok' | 'error';

  @ApiProperty({
    description: 'Время формирования ответа в ISO 8601.',
    example: '2026-07-15T10:00:00.000Z',
  })
  timestamp!: string;
}

export class HealthDependencyDto {
  @ApiProperty({
    description: 'Статус зависимости.',
    example: 'ok',
  })
  status!: 'ok' | 'error';
}

export class ReadinessResponseDto extends HealthResponseDto {
  @ApiProperty({
    description: 'Статусы внешних зависимостей приложения.',
    example: {
      database: { status: 'ok' },
    },
  })
  dependencies!: Record<string, HealthDependencyDto>;
}

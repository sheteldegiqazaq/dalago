import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const SAMPLE_SESSION_ROLES = ['BUYER', 'SUPPLIER'] as const;

export class SampleSessionDto {
  @ApiProperty({ enum: SAMPLE_SESSION_ROLES, example: 'BUYER' })
  @IsIn(SAMPLE_SESSION_ROLES)
  role!: (typeof SAMPLE_SESSION_ROLES)[number];
}

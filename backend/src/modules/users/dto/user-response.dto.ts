import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '@generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя.',
    example: 'b7e2a76b-52c1-4d9d-8d64-22f872c7f9f4',
  })
  id!: string;

  @ApiProperty({
    description: 'Email пользователя.',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Отображаемое имя пользователя.',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'Роль пользователя в системе.',
    enum: ['BUYER', 'SUPPLIER', 'ADMIN'],
    example: 'BUYER',
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Дата создания пользователя в ISO 8601.',
    example: '2026-07-15T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Дата последнего обновления пользователя в ISO 8601.',
    example: '2026-07-15T10:00:00.000Z',
  })
  updatedAt!: string;
}

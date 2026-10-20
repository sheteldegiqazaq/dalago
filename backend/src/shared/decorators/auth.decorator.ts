import { applyDecorators, UseGuards } from '@nestjs/common';
import type { UserRole } from '@generated/prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Authorization(...roles: UserRole[]) {
  if (roles.length > 0) {
    return applyDecorators(
      Roles(...roles),
      UseGuards(JwtAuthGuard, RolesGuard),
    );
  }

  return applyDecorators(UseGuards(JwtAuthGuard));
}

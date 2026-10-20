import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';

export function OptionalAuthorization() {
  return applyDecorators(UseGuards(OptionalJwtAuthGuard));
}

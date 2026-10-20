import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@shared/guards/optional-jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('app.jwtSecret'),
        signOptions: {
          // Refresh-токенов в MVP нет, поэтому access-токен живёт дольше.
          expiresIn: config.getOrThrow<number>('app.jwtExpiresInSeconds'),
        },
      }),
    }),
  ],
  providers: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
  exports: [JwtModule, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
})
export class AuthModule {}

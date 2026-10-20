import { Module } from '@nestjs/common';
import {
  ACCOUNT_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_ISSUER,
} from './accounts.tokens';
import { AuthController } from './controllers/auth.controller';
import { JwtTokenIssuer } from './gateways/jwt-token-issuer';
import { ScryptPasswordHasher } from './gateways/scrypt-password-hasher';
import type { PasswordHasher } from './ports/password-hasher';
import type { TokenIssuer } from './ports/token-issuer';
import type { AccountRepository } from './repositories/account.repository';
import { PrismaAccountRepository } from './repositories/prisma-account.repository';
import { SessionService } from './services/session.service';
import { GetMeUseCase } from './use-cases/get-me.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { StartSampleSessionUseCase } from './use-cases/start-sample-session.use-case';
import { UpdateMeUseCase } from './use-cases/update-me.use-case';

@Module({
  controllers: [AuthController],
  providers: [
    { provide: ACCOUNT_REPOSITORY, useClass: PrismaAccountRepository },
    { provide: PASSWORD_HASHER, useClass: ScryptPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuer },
    {
      provide: SessionService,
      useFactory: (tokens: TokenIssuer) => new SessionService(tokens),
      inject: [TOKEN_ISSUER],
    },
    {
      provide: RegisterUseCase,
      useFactory: (
        accounts: AccountRepository,
        hasher: PasswordHasher,
        sessions: SessionService,
      ) => new RegisterUseCase(accounts, hasher, sessions),
      inject: [ACCOUNT_REPOSITORY, PASSWORD_HASHER, SessionService],
    },
    {
      provide: LoginUseCase,
      useFactory: (
        accounts: AccountRepository,
        hasher: PasswordHasher,
        sessions: SessionService,
      ) => new LoginUseCase(accounts, hasher, sessions),
      inject: [ACCOUNT_REPOSITORY, PASSWORD_HASHER, SessionService],
    },
    {
      provide: StartSampleSessionUseCase,
      useFactory: (accounts: AccountRepository, sessions: SessionService) =>
        new StartSampleSessionUseCase(accounts, sessions),
      inject: [ACCOUNT_REPOSITORY, SessionService],
    },
    {
      provide: GetMeUseCase,
      useFactory: (accounts: AccountRepository) => new GetMeUseCase(accounts),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: UpdateMeUseCase,
      useFactory: (accounts: AccountRepository) =>
        new UpdateMeUseCase(accounts),
      inject: [ACCOUNT_REPOSITORY],
    },
  ],
})
export class AccountsModule {}

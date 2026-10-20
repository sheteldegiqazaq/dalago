import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import type { UserRepository } from './repositories/user.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { USER_REPOSITORY } from './user.tokens';
import { UsersFacade } from './users.facade';
import { UserUniquenessService } from './services/user-uniqueness.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersFacade,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: UserUniquenessService,
      useFactory: (users: UserRepository) => new UserUniquenessService(users),
      inject: [USER_REPOSITORY],
    },
    {
      provide: CreateUserUseCase,
      useFactory: (users: UserRepository, uniqueness: UserUniquenessService) =>
        new CreateUserUseCase(users, uniqueness),
      inject: [USER_REPOSITORY, UserUniquenessService],
    },
    {
      provide: GetUserUseCase,
      useFactory: (users: UserRepository) => new GetUserUseCase(users),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (users: UserRepository, uniqueness: UserUniquenessService) =>
        new UpdateUserUseCase(users, uniqueness),
      inject: [USER_REPOSITORY, UserUniquenessService],
    },
  ],
  exports: [UsersFacade],
})
export class UsersModule {}

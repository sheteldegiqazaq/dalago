import { Injectable } from '@nestjs/common';
import {
  type CreateUserCommand,
  CreateUserUseCase,
} from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';

@Injectable()
export class UsersFacade {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
  ) {}

  create(command: CreateUserCommand) {
    return this.createUser.execute(command);
  }

  getById(id: string) {
    return this.getUser.execute(id);
  }
}

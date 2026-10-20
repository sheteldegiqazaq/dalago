import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Authorization } from '@shared/decorators/auth.decorator';
import { UserResponseMapper } from '../mappers/user-response.mapper';
import {
  type CreateUserCommand,
  CreateUserUseCase,
} from '../use-cases/create-user.use-case';
import { GetUserUseCase } from '../use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiCreateUser,
  ApiGetUser,
  ApiUpdateUser,
  ApiUsersTags,
} from '../users.swagger';

// Служебный API для администратора. Регистрация пользователей идёт через /auth/register.
@ApiUsersTags()
@Authorization('ADMIN')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
  ) {}

  @Post()
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDto) {
    const command: CreateUserCommand = {
      email: dto.email,
      name: dto.name,
    };
    const user = await this.createUser.execute(command);

    return UserResponseMapper.toHttp(user);
  }

  @Get(':id')
  @ApiGetUser()
  async getById(@Param('id') id: string) {
    const user = await this.getUser.execute(id);

    return UserResponseMapper.toHttp(user);
  }

  @Patch(':id')
  @ApiUpdateUser()
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.updateUser.execute({
      id,
      email: dto.email,
      name: dto.name,
    });

    return UserResponseMapper.toHttp(user);
  }
}

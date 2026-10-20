import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiStatusEnum,
  apiResponseConstructor,
} from '@shared/openapi/api-response-constructor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

export function ApiUsersTags() {
  return applyDecorators(ApiTags('Пользователи'), ApiBearerAuth('bearer'));
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать пользователя' }),
    ApiBody({
      type: CreateUserDto,
      examples: {
        default: {
          summary: 'Новый пользователь',
          value: {
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
      required: true,
    }),
    ApiCreatedResponse({
      description: 'Пользователь успешно создан.',
      type: UserResponseDto,
    }),
    apiResponseConstructor(ApiStatusEnum.BAD_REQUEST),
    apiResponseConstructor(ApiStatusEnum.INTERNAL_SERVER_ERROR),
  );
}

export function ApiGetUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить пользователя по идентификатору' }),
    ApiParam({
      name: 'id',
      description: 'Уникальный идентификатор пользователя.',
      example: 'b7e2a76b-52c1-4d9d-8d64-22f872c7f9f4',
    }),
    ApiExtraModels(UserResponseDto),
    ApiOkResponse({
      description: 'Успешно. Возвращает пользователя.',
      schema: {
        allOf: [{ $ref: getSchemaPath(UserResponseDto) }],
      },
    }),
    apiResponseConstructor({
      status: ApiStatusEnum.NOT_FOUND,
      description: 'Пользователь не найден.',
    }),
    apiResponseConstructor(ApiStatusEnum.INTERNAL_SERVER_ERROR),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить пользователя' }),
    ApiParam({
      name: 'id',
      description: 'Уникальный идентификатор пользователя.',
      example: 'b7e2a76b-52c1-4d9d-8d64-22f872c7f9f4',
    }),
    ApiBody({ type: UpdateUserDto, required: true }),
    ApiOkResponse({
      description: 'Пользователь успешно обновлён.',
      type: UserResponseDto,
    }),
    apiResponseConstructor(ApiStatusEnum.BAD_REQUEST),
    apiResponseConstructor({
      status: ApiStatusEnum.NOT_FOUND,
      description: 'Пользователь не найден.',
    }),
    apiResponseConstructor(ApiStatusEnum.INTERNAL_SERVER_ERROR),
  );
}

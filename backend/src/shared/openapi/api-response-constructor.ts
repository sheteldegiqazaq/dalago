import { applyDecorators } from '@nestjs/common';
import { ApiResponse, type ApiResponseSchemaHost } from '@nestjs/swagger';

export enum ApiStatusEnum {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

type ApiResponseWithSchema = {
  status: ApiStatusEnum;
  description: string;
  schema: ApiResponseSchemaHost['schema'];
};

type ApiResponseWithDescription = {
  status: ApiStatusEnum.CONFLICT | ApiStatusEnum.NOT_FOUND;
  description: string;
};

type ResponseConstructorOptions =
  ApiStatusEnum | ApiResponseWithSchema | ApiResponseWithDescription;

export function apiResponseConstructor(
  ...options: ResponseConstructorOptions[]
) {
  return applyDecorators(
    ...options.map((option) => {
      if (typeof option === 'number') {
        return responseDecorator(option);
      }

      if ('schema' in option) {
        return ApiResponse({
          status: option.status,
          description: option.description,
          schema: option.schema,
        });
      }

      return ApiResponse({
        status: option.status,
        description: option.description,
      });
    }),
  );
}

function responseDecorator(status: ApiStatusEnum) {
  switch (status) {
    case ApiStatusEnum.BAD_REQUEST:
      return ApiResponse({
        status,
        description: 'Некорректные данные',
        schema: { example: { message: 'Некорректные данные' } },
      });
    case ApiStatusEnum.UNAUTHORIZED:
      return ApiResponse({
        status,
        description: 'Пользователь не авторизован',
        schema: { example: { message: 'Пользователь не авторизован' } },
      });
    case ApiStatusEnum.FORBIDDEN:
      return ApiResponse({
        status,
        description: 'Нет доступа',
        schema: { example: { message: 'Нет доступа' } },
      });
    case ApiStatusEnum.INTERNAL_SERVER_ERROR:
      return ApiResponse({
        status,
        description: 'Ошибка сервера',
        schema: { example: { message: 'Ошибка сервера' } },
      });
    default:
      return ApiResponse({
        status,
        description: '',
      });
  }
}

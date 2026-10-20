import type { UserResponseDto } from '../dto/user-response.dto';

export class UserResponseMapper {
  static toHttp(user: {
    id: string;
    email: string;
    name: string;
    role: UserResponseDto['role'];
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

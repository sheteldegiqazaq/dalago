import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'buyer@demo.dalago.kz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'demo12345' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  password!: string;
}

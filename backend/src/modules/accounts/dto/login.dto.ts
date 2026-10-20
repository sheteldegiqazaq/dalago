import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'buyer@dalago.example' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'dalago12345' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  password!: string;
}

import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, MeResponseDto } from '../dto/me-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { SampleSessionDto } from '../dto/sample-session.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { MeResponseMapper } from '../mappers/me-response.mapper';
import { GetMeUseCase } from '../use-cases/get-me.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { StartSampleSessionUseCase } from '../use-cases/start-sample-session.use-case';
import { UpdateMeUseCase } from '../use-cases/update-me.use-case';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
    private readonly startSample: StartSampleSessionUseCase,
    private readonly getMe: GetMeUseCase,
    private readonly updateMe: UpdateMeUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя вместе с компанией' })
  @ApiOkResponse({ type: AuthResponseDto })
  @HttpCode(200)
  async signUp(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const { accessToken, account } = await this.register.execute(dto);

    return { accessToken, user: MeResponseMapper.toHttp(account) };
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiOkResponse({ type: AuthResponseDto })
  @HttpCode(200)
  async signIn(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const { accessToken, account } = await this.login.execute(dto);

    return { accessToken, user: MeResponseMapper.toHttp(account) };
  }

  @Post('sample-session')
  @ApiOperation({
    summary: 'Вход без регистрации в общий аккаунт-пример выбранной роли',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @HttpCode(200)
  async startSampleSession(
    @Body() dto: SampleSessionDto,
  ): Promise<AuthResponseDto> {
    const { accessToken, account } = await this.startSample.execute(dto);

    return { accessToken, user: MeResponseMapper.toHttp(account) };
  }

  @Get('me')
  @Authorization()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Текущий пользователь и его компания' })
  @ApiOkResponse({ type: MeResponseDto })
  async me(@Authorized('id') userId: string): Promise<MeResponseDto> {
    return MeResponseMapper.toHttp(await this.getMe.execute(userId));
  }

  @Patch('me')
  @Authorization()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Обновить имя или язык интерфейса' })
  @ApiOkResponse({ type: MeResponseDto })
  async update(
    @Authorized('id') userId: string,
    @Body() dto: UpdateMeDto,
  ): Promise<MeResponseDto> {
    const account = await this.updateMe.execute({ userId, ...dto });

    return MeResponseMapper.toHttp(account);
  }
}

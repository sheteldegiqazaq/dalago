import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import type { AuthenticatedUser } from '@shared/types/authenticated-user';
import {
  InquiryDetailsDto,
  InquiryListItemDto,
  PostMessageDto,
  StartInquiryDto,
} from '../dto/inquiry.dto';
import { InquiryMapper } from '../mappers/inquiry.mapper';
import { GetInquiryUseCase } from '../use-cases/get-inquiry.use-case';
import { ListInquiriesUseCase } from '../use-cases/list-inquiries.use-case';
import { PostMessageUseCase } from '../use-cases/post-message.use-case';
import { StartInquiryUseCase } from '../use-cases/start-inquiry.use-case';

@ApiTags('Обращения и переписка')
@ApiBearerAuth('bearer')
@Authorization()
@Controller('inquiries')
export class InquiriesController {
  constructor(
    private readonly startInquiry: StartInquiryUseCase,
    private readonly listInquiries: ListInquiriesUseCase,
    private readonly getInquiry: GetInquiryUseCase,
    private readonly postMessage: PostMessageUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Мои обращения' })
  @ApiOkResponse({ type: [InquiryListItemDto] })
  async list(
    @Authorized() user: AuthenticatedUser,
  ): Promise<InquiryListItemDto[]> {
    const inquiries = await this.listInquiries.execute(user.companyId);

    return inquiries.map((inquiry) =>
      InquiryMapper.toListItem(inquiry, user.companyId!),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Написать компании (по товару или заявке)' })
  @ApiOkResponse({ type: InquiryDetailsDto })
  @HttpCode(200)
  async start(
    @Authorized() user: AuthenticatedUser,
    @Body() dto: StartInquiryDto,
  ): Promise<InquiryDetailsDto> {
    const inquiry = await this.startInquiry.execute({
      fromCompanyId: user.companyId,
      authorUserId: user.id,
      toCompanyId: dto.toCompanyId,
      productId: dto.productId || null,
      requestId: dto.requestId || null,
      subject: dto.subject,
      body: dto.message,
    });

    return InquiryMapper.toDetails(inquiry, user.companyId!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Переписка (только участникам)' })
  @ApiOkResponse({ type: InquiryDetailsDto })
  async get(
    @Param('id') id: string,
    @Authorized() user: AuthenticatedUser,
  ): Promise<InquiryDetailsDto> {
    const inquiry = await this.getInquiry.execute(id, user.companyId);

    return InquiryMapper.toDetails(inquiry, user.companyId!);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Ответить в переписке' })
  @ApiOkResponse({ type: InquiryDetailsDto })
  @HttpCode(200)
  async reply(
    @Param('id') id: string,
    @Authorized() user: AuthenticatedUser,
    @Body() dto: PostMessageDto,
  ): Promise<InquiryDetailsDto> {
    const inquiry = await this.postMessage.execute(
      id,
      user.companyId,
      user.id,
      dto.message,
    );

    return InquiryMapper.toDetails(inquiry, user.companyId!);
  }
}

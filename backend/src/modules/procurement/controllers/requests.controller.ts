import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '@shared/types/authenticated-user';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import { OptionalAuthorization } from '@shared/decorators/optional-auth.decorator';
import {
  OfferDto,
  RequestDetailsDto,
  RequestListItemDto,
  RequestPageDto,
} from '../dto/procurement-response.dto';
import {
  MyRequestsQueryDto,
  OfferInputDto,
  RequestInputDto,
  RequestQueryDto,
} from '../dto/request-input.dto';
import { ProcurementResponseMapper } from '../mappers/procurement-response.mapper';
import { CloseRequestUseCase } from '../use-cases/close-request.use-case';
import { CreateOfferUseCase } from '../use-cases/create-offer.use-case';
import { CreateRequestUseCase } from '../use-cases/create-request.use-case';
import { GetRequestUseCase } from '../use-cases/get-request.use-case';
import { ListActiveRequestsUseCase } from '../use-cases/list-active-requests.use-case';
import { ListMyRequestsUseCase } from '../use-cases/list-my-requests.use-case';
import { UpdateRequestUseCase } from '../use-cases/update-request.use-case';

const ownerView = <T>(request: T) => ({
  request,
  isOwner: true,
  showBuyerPhone: true,
  myOfferId: null,
  canOffer: false,
});

@ApiTags('Оптовые заявки')
@Controller('requests')
export class RequestsController {
  constructor(
    private readonly listActive: ListActiveRequestsUseCase,
    private readonly listMine: ListMyRequestsUseCase,
    private readonly getRequest: GetRequestUseCase,
    private readonly createRequest: CreateRequestUseCase,
    private readonly updateRequest: UpdateRequestUseCase,
    private readonly closeRequest: CloseRequestUseCase,
    private readonly createOffer: CreateOfferUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Активные заявки покупателей (доска для поставщиков)',
  })
  @ApiOkResponse({ type: RequestPageDto })
  async list(@Query() query: RequestQueryDto): Promise<RequestPageDto> {
    const page = await this.listActive.execute({
      q: query.q,
      categorySlug: query.category,
      cityId: query.city,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
    });

    return {
      ...page,
      items: page.items.map((item) =>
        ProcurementResponseMapper.toListItem(item, false),
      ),
    };
  }

  @Get('mine')
  @Authorization('BUYER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Мои заявки' })
  @ApiOkResponse({ type: [RequestListItemDto] })
  async mine(
    @Authorized('companyId') companyId: string | undefined,
    @Query() query: MyRequestsQueryDto,
  ): Promise<RequestListItemDto[]> {
    const requests = await this.listMine.execute(companyId, query.status);

    return requests.map((item) =>
      ProcurementResponseMapper.toListItem(item, true),
    );
  }

  @Get(':id')
  @OptionalAuthorization()
  @ApiOperation({ summary: 'Заявка; предложения видят только участники' })
  @ApiOkResponse({ type: RequestDetailsDto })
  async getById(
    @Param('id') id: string,
    @Authorized() user: AuthenticatedUser | undefined,
  ): Promise<RequestDetailsDto> {
    const view = await this.getRequest.execute(id, {
      companyId: user?.companyId,
      role: user?.role,
    });

    return ProcurementResponseMapper.toDetails(view);
  }

  @Post()
  @Authorization('BUYER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Создать оптовую заявку' })
  @ApiOkResponse({ type: RequestDetailsDto })
  @HttpCode(200)
  async create(
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: RequestInputDto,
  ): Promise<RequestDetailsDto> {
    const request = await this.createRequest.execute(
      companyId,
      toRequestInput(dto),
    );

    return ProcurementResponseMapper.toDetails({
      ...ownerView(request),
      offers: request.offers,
    });
  }

  @Patch(':id')
  @Authorization('BUYER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Изменить активную заявку' })
  @ApiOkResponse({ type: RequestDetailsDto })
  async update(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: RequestInputDto,
  ): Promise<RequestDetailsDto> {
    const request = await this.updateRequest.execute(
      id,
      companyId,
      toRequestInput(dto),
    );

    return ProcurementResponseMapper.toDetails({
      ...ownerView(request),
      offers: request.offers,
    });
  }

  @Post(':id/close')
  @Authorization('BUYER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Закрыть заявку без выбора предложения' })
  @ApiOkResponse({ type: RequestDetailsDto })
  @HttpCode(200)
  async close(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<RequestDetailsDto> {
    const request = await this.closeRequest.execute(id, companyId);

    return ProcurementResponseMapper.toDetails({
      ...ownerView(request),
      offers: request.offers,
    });
  }

  @Post(':id/offers')
  @Authorization('SUPPLIER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Отправить предложение по заявке' })
  @ApiOkResponse({ type: OfferDto })
  @HttpCode(200)
  async offer(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: OfferInputDto,
  ): Promise<OfferDto> {
    const offer = await this.createOffer.execute(
      id,
      companyId,
      toOfferInput(dto),
    );

    return ProcurementResponseMapper.toOffer(offer);
  }
}

export function toRequestInput(dto: RequestInputDto) {
  return {
    title: dto.title,
    categoryId: dto.categoryId || null,
    description: dto.description ?? null,
    quantity: dto.quantity,
    unit: dto.unit,
    targetPrice: dto.targetPrice ?? null,
    deliveryCityId: dto.deliveryCityId,
    deliveryAddress: dto.deliveryAddress ?? null,
    desiredDate: dto.desiredDate,
  };
}

export function toOfferInput(dto: OfferInputDto) {
  return {
    quantity: dto.quantity,
    pricePerUnit: dto.pricePerUnit,
    deliveryCost: dto.deliveryCost ?? null,
    estimatedDeliveryDate: dto.estimatedDeliveryDate,
    terms: dto.terms ?? null,
    productId: dto.productId || null,
  };
}

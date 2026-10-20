import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import {
  OfferDto,
  RequestDetailsDto,
  SupplierOfferDto,
} from '../dto/procurement-response.dto';
import { OfferInputDto } from '../dto/request-input.dto';
import { ProcurementResponseMapper } from '../mappers/procurement-response.mapper';
import { DecideOfferUseCase } from '../use-cases/decide-offer.use-case';
import { ListMyOffersUseCase } from '../use-cases/list-my-offers.use-case';
import { UpdateOfferUseCase } from '../use-cases/update-offer.use-case';
import { toOfferInput } from './requests.controller';

@ApiTags('Предложения поставщиков')
@ApiBearerAuth('bearer')
@Controller('offers')
export class OffersController {
  constructor(
    private readonly listMine: ListMyOffersUseCase,
    private readonly updateOffer: UpdateOfferUseCase,
    private readonly decideOffer: DecideOfferUseCase,
  ) {}

  @Get('mine')
  @Authorization('SUPPLIER')
  @ApiOperation({ summary: 'Мои предложения (поставщик)' })
  @ApiOkResponse({ type: [SupplierOfferDto] })
  async mine(
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<SupplierOfferDto[]> {
    const offers = await this.listMine.execute(companyId);

    return offers.map((o) => ProcurementResponseMapper.toSupplierOffer(o));
  }

  @Patch(':id')
  @Authorization('SUPPLIER')
  @ApiOperation({ summary: 'Изменить своё ожидающее предложение' })
  @ApiOkResponse({ type: OfferDto })
  async update(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: OfferInputDto,
  ): Promise<OfferDto> {
    const offer = await this.updateOffer.execute(
      id,
      companyId,
      toOfferInput(dto),
    );

    return ProcurementResponseMapper.toOffer(offer);
  }

  @Post(':id/accept')
  @Authorization('BUYER')
  @ApiOperation({ summary: 'Принять предложение (остальные будут отклонены)' })
  @ApiOkResponse({ type: RequestDetailsDto })
  @HttpCode(200)
  accept(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<RequestDetailsDto> {
    return this.decide(id, companyId, 'accept');
  }

  @Post(':id/reject')
  @Authorization('BUYER')
  @ApiOperation({ summary: 'Отклонить предложение' })
  @ApiOkResponse({ type: RequestDetailsDto })
  @HttpCode(200)
  reject(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<RequestDetailsDto> {
    return this.decide(id, companyId, 'reject');
  }

  private async decide(
    id: string,
    companyId: string | undefined,
    decision: 'accept' | 'reject',
  ): Promise<RequestDetailsDto> {
    const request = await this.decideOffer.execute(id, companyId, decision);

    return ProcurementResponseMapper.toDetails({
      request,
      offers: request.offers,
      isOwner: true,
      showBuyerPhone: true,
      myOfferId: null,
      canOffer: false,
    });
  }
}

import { Module } from '@nestjs/common';
import { OffersController } from './controllers/offers.controller';
import { RequestsController } from './controllers/requests.controller';
import { PrismaProcurementRepository } from './repositories/prisma-procurement.repository';
import type { ProcurementRepository } from './repositories/procurement.repository';
import { PROCUREMENT_REPOSITORY } from './procurement.tokens';
import { CloseRequestUseCase } from './use-cases/close-request.use-case';
import { CreateOfferUseCase } from './use-cases/create-offer.use-case';
import { CreateRequestUseCase } from './use-cases/create-request.use-case';
import { DecideOfferUseCase } from './use-cases/decide-offer.use-case';
import { GetRequestUseCase } from './use-cases/get-request.use-case';
import { ListActiveRequestsUseCase } from './use-cases/list-active-requests.use-case';
import { ListMyOffersUseCase } from './use-cases/list-my-offers.use-case';
import { ListMyRequestsUseCase } from './use-cases/list-my-requests.use-case';
import { UpdateOfferUseCase } from './use-cases/update-offer.use-case';
import { UpdateRequestUseCase } from './use-cases/update-request.use-case';

const useCases = [
  ListActiveRequestsUseCase,
  ListMyRequestsUseCase,
  GetRequestUseCase,
  CreateRequestUseCase,
  UpdateRequestUseCase,
  CloseRequestUseCase,
  CreateOfferUseCase,
  UpdateOfferUseCase,
  DecideOfferUseCase,
  ListMyOffersUseCase,
] as const;

@Module({
  controllers: [RequestsController, OffersController],
  providers: [
    { provide: PROCUREMENT_REPOSITORY, useClass: PrismaProcurementRepository },
    ...useCases.map((UseCase) => ({
      provide: UseCase,
      useFactory: (procurement: ProcurementRepository) =>
        new UseCase(procurement),
      inject: [PROCUREMENT_REPOSITORY],
    })),
  ],
})
export class ProcurementModule {}

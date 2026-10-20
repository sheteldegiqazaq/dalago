import { Module } from '@nestjs/common';
import { ReferenceController } from './controllers/reference.controller';
import { PrismaReferenceRepository } from './repositories/prisma-reference.repository';
import type { ReferenceRepository } from './repositories/reference.repository';
import { REFERENCE_REPOSITORY } from './reference.tokens';
import { ReferenceFacade } from './reference.facade';
import { GetReferenceUseCase } from './use-cases/get-reference.use-case';

@Module({
  controllers: [ReferenceController],
  providers: [
    ReferenceFacade,
    { provide: REFERENCE_REPOSITORY, useClass: PrismaReferenceRepository },
    {
      provide: GetReferenceUseCase,
      useFactory: (reference: ReferenceRepository) =>
        new GetReferenceUseCase(reference),
      inject: [REFERENCE_REPOSITORY],
    },
  ],
  exports: [ReferenceFacade],
})
export class ReferenceModule {}

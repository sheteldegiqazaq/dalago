import { Module } from '@nestjs/common';
import { InquiriesController } from './controllers/inquiries.controller';
import { INQUIRY_REPOSITORY } from './inquiries.tokens';
import type { InquiryRepository } from './repositories/inquiry.repository';
import { PrismaInquiryRepository } from './repositories/prisma-inquiry.repository';
import { GetInquiryUseCase } from './use-cases/get-inquiry.use-case';
import { ListInquiriesUseCase } from './use-cases/list-inquiries.use-case';
import { PostMessageUseCase } from './use-cases/post-message.use-case';
import { StartInquiryUseCase } from './use-cases/start-inquiry.use-case';

const useCases = [
  StartInquiryUseCase,
  ListInquiriesUseCase,
  GetInquiryUseCase,
  PostMessageUseCase,
] as const;

@Module({
  controllers: [InquiriesController],
  providers: [
    { provide: INQUIRY_REPOSITORY, useClass: PrismaInquiryRepository },
    ...useCases.map((UseCase) => ({
      provide: UseCase,
      useFactory: (inquiries: InquiryRepository) => new UseCase(inquiries),
      inject: [INQUIRY_REPOSITORY],
    })),
  ],
})
export class InquiriesModule {}

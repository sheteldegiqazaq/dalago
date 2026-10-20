import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseSeederService } from './seeding/database-seeder.service';

@Global()
@Module({
  providers: [PrismaService, DatabaseSeederService],
  exports: [PrismaService, DatabaseSeederService],
})
export class DatabaseModule {}

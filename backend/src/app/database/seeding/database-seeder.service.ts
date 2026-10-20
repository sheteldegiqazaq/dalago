import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { seedDatabase } from './seed-database';

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async seed(): Promise<void> {
    const result = await seedDatabase(this.prisma, {
      adminEmail: this.config.getOrThrow<string>('seed.adminEmail'),
      adminName: this.config.getOrThrow<string>('seed.adminName'),
    });

    this.logger.log(
      `Seed completed. Admin: ${result.admin.email}, samples: ${JSON.stringify(result.samples)}`,
    );
  }
}

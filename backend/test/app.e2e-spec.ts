import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from '../src/app/setup-app';

type HealthResponse = {
  status?: unknown;
  timestamp?: unknown;
};

describe('Health (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        const response = body as HealthResponse;

        expect(response.status).toBe('ok');
        expect(typeof response.timestamp).toBe('string');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});

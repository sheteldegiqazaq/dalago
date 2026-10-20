import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { setupApp } from '../src/app/setup-app';
import { AppModule } from '../src/app.module';

// Служебный API пользователей доступен только администратору.
describe('Users (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects anonymous user creation', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ email: 'anon@example.com', name: 'Anon' })
      .expect(401);
  });

  it('rejects non-admin users', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'buyer@demo.dalago.kz', password: 'demo12345' })
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;

    await request(app.getHttpServer())
      .get('/api/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});

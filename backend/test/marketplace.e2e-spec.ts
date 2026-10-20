/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { PrismaService } from '../src/app/database/prisma.service';
import {
  SAMPLE_EMAIL_DOMAIN,
  SAMPLE_PASSWORD,
} from '../src/app/database/seeding/seed-database';
import { setupApp } from '../src/app/setup-app';
import { AppModule } from '../src/app.module';

/**
 * Сквозной сценарий на реальной базе с примерами данных (нужен `pnpm db:seed`):
 * поиск → заявка покупателя → предложение поставщика → принятие,
 * плюс проверки прав доступа.
 */
type Body = Record<string, any>;

const PASSWORD = SAMPLE_PASSWORD;
const sampleEmail = (name: string) => `${name}@${SAMPLE_EMAIL_DOMAIN}`;
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

describe('Marketplace flow (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const createdRequestIds: string[] = [];
  const tokens: Record<string, string> = {};

  const http = () => request(app.getHttpServer());
  const auth = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    for (const [who, email] of [
      ['buyer', sampleEmail('buyer')],
      ['shop', sampleEmail('shop')],
      ['supplier', sampleEmail('supplier')],
      ['meat', sampleEmail('meat')],
    ]) {
      const response = await http()
        .post('/api/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);
      tokens[who] = (response.body as Body).accessToken as string;
    }
  });

  afterAll(async () => {
    await prisma.purchaseRequest.deleteMany({
      where: { id: { in: createdRequestIds } },
    });
    await app.close();
  });

  it('rejects wrong password with a stable error code', async () => {
    const response = await http()
      .post('/api/auth/login')
      .send({ email: sampleEmail('buyer'), password: 'wrong' })
      .expect(401);

    expect((response.body as Body).code).toBe('INVALID_CREDENTIALS');
  });

  it('opens only sample accounts without a password', async () => {
    const response = await http()
      .post('/api/auth/sample-session')
      .send({ role: 'SUPPLIER' })
      .expect(200);
    const body = response.body as Body;
    const user = body.user as Body;

    expect(body.accessToken).toEqual(expect.any(String));
    expect(user.role).toBe('SUPPLIER');
    expect((user.company as Body).isSample).toBe(true);

    await http()
      .post('/api/auth/sample-session')
      .send({ role: 'ADMIN' })
      .expect(400);
  });

  it('returns reference data for Abai Region with localized names', async () => {
    const response = await http().get('/api/reference').expect(200);
    const body = response.body as Body;
    const abai = (body.regions as Body[]).find((r) => r.id === 'abai')!;

    expect(abai.isActive).toBe(true);
    expect((abai.cities as Body[]).map((c) => c.id)).toContain('semey');
    expect(
      (body.categories as Body[]).find((c) => c.slug === 'dairy')!.nameKk,
    ).toBe('Сүт өнімдері');
  });

  it('filters the catalog by category, price and sorts by price', async () => {
    const response = await http()
      .get('/api/products?category=vegetables&maxPrice=150&sort=price_asc')
      .expect(200);
    const items = (response.body as Body).items as Body[];
    const prices = items.map((item) => item.price as number);

    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every((item) => (item.category as Body).slug === 'vegetables'),
    ).toBe(true);
    expect(prices.every((price) => price <= 150)).toBe(true);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it('finds products by Kazakh name and converts kg to tonnes for quantity', async () => {
    const kk = await http()
      .get(`/api/products?q=${encodeURIComponent('картоп')}`)
      .expect(200);
    expect((kk.body as Body).total).toBeGreaterThanOrEqual(2);

    const grain = await http()
      .get('/api/products?category=grain&quantity=10000&unit=KG')
      .expect(200);
    const titles = ((grain.body as Body).items as Body[]).map(
      (i) => i.title as string,
    );
    expect(titles).toContain('Пшеница 3 класса');
  });

  it('hides inactive listings from the public catalog', async () => {
    const response = await http().get('/api/products?q=свекла').expect(200);

    expect((response.body as Body).total).toBe(0);
  });

  it('runs the full request → offer → accept lifecycle', async () => {
    const reference = (await http().get('/api/reference').expect(200))
      .body as Body;
    const vegetables = (reference.categories as Body[]).find(
      (c) => c.slug === 'vegetables',
    )!;

    // 1. Покупатель создаёт заявку
    const created = await http()
      .post('/api/requests')
      .set(auth('buyer'))
      .send({
        title: 'E2E: картофель 250 кг',
        categoryId: vegetables.id,
        quantity: 250,
        unit: 'KG',
        targetPrice: 145,
        deliveryCityId: 'semey',
        desiredDate: inDays(5),
      })
      .expect(200);
    const requestId = (created.body as Body).id as string;
    createdRequestIds.push(requestId);
    expect((created.body as Body).status).toBe('OPEN');

    // 2. Заявка видна на общей доске, телефон покупателя скрыт
    const board = await http().get('/api/requests').expect(200);
    const listed = ((board.body as Body).items as Body[]).find(
      (r) => r.id === requestId,
    )!;
    expect((listed.buyer as Body).phone).toBeNull();

    // 3. Поставщик отправляет предложение
    const offer = await http()
      .post(`/api/requests/${requestId}/offers`)
      .set(auth('supplier'))
      .send({
        quantity: 250,
        pricePerUnit: 138,
        deliveryCost: 2500,
        estimatedDeliveryDate: inDays(3),
        terms: 'E2E',
      })
      .expect(200);
    const offerId = (offer.body as Body).id as string;
    expect((offer.body as Body).totalCost).toBe(250 * 138 + 2500);

    // Повторное предложение того же поставщика запрещено
    const duplicate = await http()
      .post(`/api/requests/${requestId}/offers`)
      .set(auth('supplier'))
      .send({
        quantity: 100,
        pricePerUnit: 130,
        estimatedDeliveryDate: inDays(3),
      })
      .expect(400);
    expect((duplicate.body as Body).code).toBe('OFFER_ALREADY_EXISTS');

    // 4. Владелец видит предложение, посторонний покупатель — нет
    const ownerView = await http()
      .get(`/api/requests/${requestId}`)
      .set(auth('buyer'))
      .expect(200);
    expect((ownerView.body as Body).status).toBe('OFFERS_RECEIVED');
    expect((ownerView.body as Body).offers).toHaveLength(1);

    const strangerView = await http()
      .get(`/api/requests/${requestId}`)
      .set(auth('shop'))
      .expect(200);
    expect((strangerView.body as Body).offers).toHaveLength(0);

    // 5. Чужой покупатель и поставщик не могут принять предложение
    await http()
      .post(`/api/offers/${offerId}/accept`)
      .set(auth('shop'))
      .expect(403);
    await http()
      .post(`/api/offers/${offerId}/accept`)
      .set(auth('supplier'))
      .expect(403);

    // 6. Владелец принимает
    const accepted = await http()
      .post(`/api/offers/${offerId}/accept`)
      .set(auth('buyer'))
      .expect(200);
    expect((accepted.body as Body).status).toBe('ACCEPTED');
    expect(((accepted.body as Body).offers as Body[])[0].status).toBe(
      'ACCEPTED',
    );

    // 7. Финальное состояние: новые предложения и повторное принятие невозможны
    const late = await http()
      .post(`/api/requests/${requestId}/offers`)
      .set(auth('meat'))
      .send({
        quantity: 10,
        pricePerUnit: 100,
        estimatedDeliveryDate: inDays(2),
      })
      .expect(400);
    expect((late.body as Body).code).toBe('REQUEST_NOT_ACTIVE');
    await http()
      .post(`/api/offers/${offerId}/accept`)
      .set(auth('buyer'))
      .expect(400);

    // Исполненная заявка скрыта от посторонних
    await http().get(`/api/requests/${requestId}`).expect(404);
  });

  it('lets the buyer close a request, rejecting pending offers', async () => {
    const created = await http()
      .post('/api/requests')
      .set(auth('buyer'))
      .send({
        title: 'E2E: закрытие',
        quantity: 10,
        unit: 'KG',
        deliveryCityId: 'semey',
        desiredDate: inDays(3),
      })
      .expect(200);
    const requestId = (created.body as Body).id as string;
    createdRequestIds.push(requestId);

    await http()
      .post(`/api/requests/${requestId}/offers`)
      .set(auth('supplier'))
      .send({
        quantity: 10,
        pricePerUnit: 100,
        estimatedDeliveryDate: inDays(2),
      })
      .expect(200);

    await http()
      .post(`/api/requests/${requestId}/close`)
      .set(auth('shop'))
      .expect(403);
    const closed = await http()
      .post(`/api/requests/${requestId}/close`)
      .set(auth('buyer'))
      .expect(200);

    expect((closed.body as Body).status).toBe('CLOSED');
    expect(((closed.body as Body).offers as Body[])[0].status).toBe('REJECTED');
  });

  it('validates input and rejects past dates', async () => {
    await http()
      .post('/api/requests')
      .set(auth('buyer'))
      .send({
        title: 'x',
        quantity: -1,
        unit: 'KG',
        deliveryCityId: 'semey',
        desiredDate: inDays(1),
      })
      .expect(400);

    const past = await http()
      .post('/api/requests')
      .set(auth('buyer'))
      .send({
        title: 'Прошлое',
        quantity: 1,
        unit: 'KG',
        deliveryCityId: 'semey',
        desiredDate: '2020-01-01',
      })
      .expect(400);
    expect((past.body as Body).code).toBe('DESIRED_DATE_IN_PAST');
  });

  it('enforces roles and ownership', async () => {
    await http().post('/api/requests').send({}).expect(401);
    // Поставщик не может создавать заявки, покупатель — объявления
    await http()
      .post('/api/requests')
      .set(auth('supplier'))
      .send({})
      .expect(403);
    await http().post('/api/products').set(auth('buyer')).send({}).expect(403);

    // Поставщик не может менять чужое объявление
    const beef = await http()
      .get(`/api/products?q=${encodeURIComponent('говядина')}`)
      .expect(200);
    const beefId = ((beef.body as Body).items as Body[])[0].id as string;
    await http()
      .patch(`/api/products/${beefId}/status`)
      .set(auth('supplier'))
      .send({ status: 'INACTIVE' })
      .expect(403);
    await http()
      .delete(`/api/products/${beefId}`)
      .set(auth('supplier'))
      .expect(403);
  });

  it('shows conversations only to participants', async () => {
    const mine = await http()
      .get('/api/inquiries')
      .set(auth('buyer'))
      .expect(200);
    const inquiryId = (mine.body as Body[])[0].id as string;

    await http()
      .get(`/api/inquiries/${inquiryId}`)
      .set(auth('buyer'))
      .expect(200);
    await http()
      .get(`/api/inquiries/${inquiryId}`)
      .set(auth('shop'))
      .expect(404);
    await http()
      .post(`/api/inquiries/${inquiryId}/messages`)
      .set(auth('shop'))
      .send({ message: 'чужое' })
      .expect(404);
  });

  it('AI search uses real catalog data and reports the active mode', async () => {
    const response = await http()
      .post('/api/ai/search')
      .send({
        query: 'нужно 50 кг свежей говядины для кафе в Семее до пятницы',
      })
      .expect(200);
    const body = response.body as Body;

    expect(['claude', 'rules']).toContain(body.mode);
    expect((body.intent as Body).categorySlug).toBe('meat');
    expect((body.items as Body[]).map((i) => i.title as string)).toContain(
      'Говядина охлаждённая',
    );
  });
});

# DalaGo Backend

NestJS API B2B-маркетплейса DalaGo.

Архитектура: **Modular Monolith** + **Vertical Slice** + лёгкие идеи
**Clean Architecture**. Без CQRS, микросервисов и абстракций ради абстракций.

## Стек

- NestJS 11
- Prisma 7 + PostgreSQL
- JWT
- OpenAPI + Redoc
- Claude API (`@anthropic-ai/sdk`): ИИ-объявления и поиск обычным языком
- Helmet, CORS, class-validator, class-transformer
- pnpm

## Быстрый старт

```bash
cp .env.example .env   # если .env ещё нет
pnpm install
docker compose up -d   # PostgreSQL
pnpm prisma:migrate
pnpm start:dev
```

- API: `http://localhost:4000/api`
- Документация (Redoc): `http://localhost:4000/api/docs`
- Health: `http://localhost:4000/api/health/ready`

При старте backend пишет OpenAPI-схему в `uploads/openapi/openapi-spec.json`.
Frontend генерирует из неё типизированный клиент командой `pnpm orval`.

## Команды

```bash
pnpm start:dev       # dev-сервер с hot reload
pnpm prisma:migrate  # создать и применить миграцию после правки schema.prisma
pnpm prisma:studio   # GUI для базы
pnpm db:seed         # сиды
pnpm test            # unit-тесты
pnpm test:e2e        # e2e (нужна запущенная база)
pnpm lint
pnpm build
```

## Документация

- [Архитектура](docs/architecture.md)
- [Модули](docs/modules.md)
- [Тестирование](docs/testing.md)
- [Правила для AI-агента](AGENTS.md)

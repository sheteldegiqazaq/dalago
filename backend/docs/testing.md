# Тестирование

Тесты проверяют поведение там, где оно живёт.

## Unit tests

Unit-тесты лежат рядом с кодом:

```txt
email.vo.ts
email.vo.spec.ts

user-uniqueness.service.ts
user-uniqueness.service.spec.ts

create-user.use-case.ts
create-user.use-case.spec.ts
get-user.use-case.ts
get-user.use-case.spec.ts
```

Unit-тесты use cases/services/value objects не используют NestJS, Prisma,
настоящую БД или внешние SDK. Они проверяют бизнес-правила, ошибки и граничные
случаи.

## Fakes and builders

Внешние зависимости заменяются in-memory/fake реализациями.

```txt
src/modules/users/testing/
  in-memory-user.repository.ts
  user.builder.ts
```

Не размазывайте `jest.fn()` по каждому тесту, если зависимость повторяется.
Лучше сделать небольшой fake, который ведёт себя как настоящий port/repository.

## Integration tests

Prisma repository не нужно unit-тестировать моками.

Проверяйте их integration/e2e тестами с настоящими сервисами. Если adapter logic
становится сложнее, добавляйте `*.integration.spec.ts`.

## E2E

Controller unit-тесты не пишем, если controller только принимает DTO и вызывает
use case.

HTTP-поведение проверяется через e2e:

```txt
test/app.e2e-spec.ts
test/users.e2e-spec.ts
```

E2E проверяет HTTP, validation pipe, controller, use case, repository и database
целиком.

## Что не тестировать

Не писать тесты для:

- DTO;
- простых mapper;
- controller, который только передаёт управление use case.

## Команды

```bash
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e
pnpm lint
pnpm lint:fix
```

`test:e2e` использует `node --experimental-vm-modules`, потому что Prisma/Jest
требуют это для dynamic imports.

E2E использует базу из `DATABASE_URL`, поэтому перед запуском поднимите
Postgres (`docker compose up -d`) и примените миграции.

`lint` только проверяет код. Для автоматического исправления используйте
`lint:fix`.

## Перед коммитом

```bash
pnpm lint
pnpm test
pnpm build
```

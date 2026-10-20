# Архитектура

## Идея

Проект построен как modular monolith с плоскими вертикальными модулями.

```txt
src/
  app/       # инфраструктура всего приложения и runtime wiring
  shared/    # стабильные cross-cutting primitives
  modules/   # автономные бизнес-модули
```

Внутри модуля нет обязательных вложенных слоёв
`presentation/application/domain/infrastructure`. Вместо этого используется
понятная структура по назначению файлов.

## Направление зависимостей

```txt
controller -> use case -> repository interface
prisma repository -> PrismaService
facade -> use case
```

Правила:

- `controllers/` знают про HTTP и DTO, но не знают про Prisma.
- `use-cases/` реализуют бизнес-сценарии и не знают про HTTP.
- `services/` содержат осмысленную переиспользуемую бизнес-логику, а не helpers.
- `repositories/*.repository.ts` описывает interface для use cases.
- `repositories/prisma-*.repository.ts` реализует interface через Prisma.
- другие модули используют только facade из public export модуля.

## `app/`

`app/` содержит runtime-инфраструктуру всего приложения:

- config и env validation;
- Prisma lifecycle;
- OpenAPI setup;
- global prefix, CORS, Helmet, filters, pipes.

В `app/` не должно быть бизнес-логики конкретного модуля.

## `shared/`

`shared/` содержит только стабильные cross-cutting primitives:

- decorators;
- guards;
- filters;
- base exceptions;
- pagination contracts;
- OpenAPI helpers;
- logger primitives;
- framework-neutral types.

Если код нужен только одному модулю, он остаётся внутри этого модуля.

## Facade

Facade — единственный публичный API модуля для других модулей.

```ts
export { UsersModule } from './users.module';
export { UsersFacade } from './users.facade';
```

Разрешено:

```ts
import { UsersFacade } from '@modules/users';
```

Запрещено импортировать внутренности чужого модуля:

```ts
import { UserRepository } from '@modules/users/repositories/user.repository';
import { CreateUserUseCase } from '@modules/users/use-cases/create-user.use-case';
import { PrismaUserRepository } from '@modules/users/repositories/prisma-user.repository';
```

Если другому модулю нужен доступ к данным или действию, добавьте метод в facade.

## Ports и gateways

Port — interface, который нужен use case.

Gateway/adapter — реализация этого interface через внешний SDK или HTTP API
(например, Claude API).

```txt
use case -> port interface -> adapter/gateway -> external dependency
```

Используйте ports/gateways для внешних, медленных, недетерминированных,
security-sensitive или потенциально заменяемых зависимостей:

- password hashing;
- JWT signing;
- email provider;
- Claude API;
- payment SDK;
- external HTTP API.

Не создавайте port для простой pure-функции.

## Транзакции между модулями

Транзакционный слой не добавляется заранее. Это deliberate decision, чтобы
starter не превратился в UnitOfWork-шаблон без реального бизнес-сценария.

### Decision rule

```txt
Одна запись / простой CRUD
  -> обычный repository method без transaction abstraction

Несколько запросов внутри одного repository method
  -> prisma.$transaction прямо внутри этого repository

Несколько repositories или facade methods в одном атомарном сценарии
  -> TransactionManager port + opaque TransactionContext
```

### Когда ничего не добавлять

Не добавляйте `TransactionManager`, `TransactionContext`, UnitOfWork или
`tx?: TransactionContext` заранее.

Это оверкодинг, если:

- use case сохраняет одну сущность;
- операция полностью помещается в один repository method;
- нет бизнес-требования откатить несколько действий вместе;
- транзакция нужна “на всякий случай”.

### Транзакция внутри одного repository

Если атомарность нужна только внутри одного repository, Prisma можно использовать
прямо там:

```ts
export class PrismaApplicationRepository implements ApplicationRepository {
  async createWithItems(data: CreateApplicationData) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: data.application,
      });

      await tx.applicationItem.createMany({
        data: data.items.map((item) => ({
          ...item,
          applicationId: application.id,
        })),
      });

      return application;
    });
  }
}
```

Use case при этом ничего не знает про transaction.

### Транзакция между repositories/facades

Когда один бизнес-сценарий должен атомарно координировать несколько repositories
или несколько facade methods, вводится transaction port.

```ts
await this.transactionManager.run(async (tx) => {
  const user = await this.usersFacade.create(command.user, tx);
  await this.applicationsFacade.createForUser({ userId: user.id }, tx);
});
```

Правила:

- `TransactionContext` opaque для use cases/facades.
- Use cases/facades не импортируют `Prisma.TransactionClient`.
- Prisma transaction implementation живёт в `app/database` или repository/gateway.
- Facade/repository получают `tx?: TransactionContext` только когда появился
  реальный transactional use case.
- Если вся атомарность внутри одного repository method, держите `$transaction`
  внутри этого repository method.

Если реализация понадобится, ожидаемые места:

```txt
src/shared/transactions/
  transaction-context.ts

src/app/database/
  prisma-transaction-manager.ts

src/modules/applications/
  ports/
    transaction-manager.ts
```

Repository interface расширяется только для методов, которые реально участвуют в
cross-repository transaction:

```ts
export interface UserRepository {
  save(data: CreateUserData, tx?: TransactionContext): Promise<User>;
}
```

Не добавляйте `tx` во все методы механически.


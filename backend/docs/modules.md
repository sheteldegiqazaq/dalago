# Модули

## Анатомия модуля

Эталонный пример: `src/modules/users`.

```txt
users/
├── controllers/
├── dto/
├── mappers/
├── repositories/
├── services/
├── testing/
├── types/
├── use-cases/
├── value-objects/
├── user.tokens.ts
├── users.facade.ts
├── users.swagger.ts
├── users.module.ts
└── index.ts
```

Не копируйте все папки автоматически. Для маленького модуля достаточно:

```txt
documents/
├── controllers/
├── dto/
├── repositories/
├── use-cases/
├── documents.facade.ts
├── documents.module.ts
└── index.ts
```

## `controllers/`

HTTP-only вход в модуль.

- принимает DTO;
- вызывает один use case;
- возвращает response или результат mapper-а;
- не принимает бизнес-решения;
- не строит Prisma query;
- не вызывает repository напрямую.

```ts
@Post()
async create(@Body() dto: CreateUserDto) {
  const user = await this.createUser.execute(dto);

  return UserResponseMapper.toHttp(user);
}
```

## `use-cases/`

Главная бизнес-логика модуля.

Один use case = одна операция.

Use case:

- получает command/query object;
- создаёт value objects;
- вызывает module services при необходимости;
- работает через repository/gateway interfaces;
- не знает HTTP;
- не знает Prisma query;
- не вызывает другой use case.

## `services/`

Осмысленная переиспользуемая бизнес-логика внутри модуля.

`services/` не должен стать папкой для случайных helpers. Сервис нужен, когда
логика:

- используется несколькими use cases;
- мешает читать use case;
- выражает отдельное бизнес-правило.

## `repositories/`

Repository отвечает только за хранение данных.

```txt
repositories/
  user.repository.ts
  prisma-user.repository.ts
  user.select.ts              # optional
```

`user.repository.ts` импортируют use cases:

```ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  exists(email: Email): Promise<boolean>;
  save(user: CreateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
```

`prisma-user.repository.ts` реализует contract и единственный в модуле работает
с Prisma.

Repository не должен содержать бизнес-действия:

```ts
// плохо
banUser(id: string): Promise<void>;
sendWelcomeEmail(id: string): Promise<void>;
```

Такие операции принадлежат use cases или module services.

## `*.select.ts`

Prisma `select` можно выносить в отдельный файл рядом с Prisma repository, если
форма ответа повторяется или стала большой.

```txt
repositories/
  report.repository.ts
  prisma-report.repository.ts
  report.select.ts
```

Рекомендуемый формат:

```ts
import type { Prisma } from '@generated/prisma/client';

export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserPublicRecord = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;
```

Использование:

```ts
async findById(id: string): Promise<UserPublicRecord | null> {
  return this.prisma.user.findUnique({
    where: { id },
    select: userPublicSelect,
  });
}
```

Правила:

- файл называется `user.select.ts`, `report.select.ts`, а не
  `return-select.ts`;
- внутри только Prisma `select/include` objects и payload types;
- select не содержит бизнес-логики;
- одинаковый смысл ответа → один общий select;
- разный смысл ответа → разные selects;
- маленький select, используемый в одном method, можно оставить inline.

Хорошие имена:

```ts
userPublicSelect
userListItemSelect
userDetailsSelect
userAdminDetailsSelect
```

Не делайте один огромный select “на все случаи”. Например, список отчётов не
должен случайно тянуть histories, nested indicators и большие relations, если
они нужны только detail endpoint.

Делите select, если:

- один endpoint показывает список, другой detail page;
- admin получает больше полей, чем public API;
- один сценарий требует тяжёлые nested relations;
- разные use cases имеют разные performance requirements.

Переиспользуйте select, если несколько repository methods действительно
возвращают одну и ту же форму данных, например `findById`, `findByEmail` и
`create` возвращают одинаковую публичную форму пользователя.

## `dto/`

DTO — HTTP contract.

DTO может содержать `class-validator`, `class-transformer` и Swagger decorators,
но не должен уходить в repository или становиться внутренней моделью модуля.

## `types/` и `value-objects/`

`types/` содержит input types для repository/use cases, criteria и result types,
если они нужны.

Не дублируйте Prisma model type, если generated type полностью подходит для
результата repository.

Если enum из Prisma один в один совпадает с бизнес-понятием, используйте
generated type/value:

```ts
import { UserRole } from '@generated/prisma/client';
```

`value-objects/` нужен для значений с валидацией и нормализацией:

```ts
const email = Email.create(command.email);
```

Entity не является обязательной частью архитектуры. Добавляйте `entities/`
только когда у объекта появляется реальное поведение и инварианты.

## `mappers/`

Mapper создаётся только когда есть реальное преобразование:

- Prisma shape не совпадает с внутренним type;
- нужно преобразовать value objects, enum, dates, nested relations;
- HTTP/facade output нужно скрыть, убрать или видоизменить;
- преобразование повторяется и стало достаточно сложным.

Не создавайте mapper для копирования полей один к одному.

## Как создать новый модуль

1. Создайте папку:

```txt
src/modules/documents/
```

2. Добавьте минимальную структуру:

```txt
documents/
├── controllers/
├── dto/
├── repositories/
│   ├── document.repository.ts
│   └── prisma-document.repository.ts
├── use-cases/
├── document.tokens.ts
├── documents.facade.ts
├── documents.module.ts
├── documents.swagger.ts
└── index.ts
```

3. Опишите repository contract.
4. Реализуйте Prisma repository.
5. Напишите один use case на одну операцию.
6. Подключите providers в `documents.module.ts`.
7. Экспортируйте только module и facade из `index.ts`.
8. Подключите module в `src/app/app.module.ts`.
9. Добавьте unit-тесты рядом с use cases/services/value objects.

Не создавайте заранее `services/`, `mappers/`, `ports/`, `gateways/`, `cache/`,
`queues/`, `listeners/`, `entities/`, если у них ещё нет ответственности.

## Куда класть код

| Задача | Куда |
| --- | --- |
| HTTP endpoint | `modules/x/controllers` |
| Request/response DTO | `modules/x/dto` |
| Преобразование данных | `modules/x/mappers` по необходимости |
| Бизнес-операция | `modules/x/use-cases` |
| Общая бизнес-логика вне use case | `modules/x/services` |
| Port для внешней возможности | `modules/x/ports` по необходимости |
| Внутренние типы | `modules/x/types` |
| Entity с поведением и инвариантами | `modules/x/entities` по необходимости |
| Value Object | `modules/x/value-objects` |
| Repository interface | `modules/x/repositories/*.repository.ts` |
| Prisma repository | `modules/x/repositories/prisma-*.repository.ts` |
| Prisma select | `modules/x/repositories/*.select.ts` по необходимости |
| Внешний API | `modules/x/gateways` по необходимости |
| API модуля для других модулей | `modules/x/*.facade.ts` |

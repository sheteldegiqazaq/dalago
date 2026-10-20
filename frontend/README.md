# DalaGo Frontend

Next.js App Router frontend for DalaGo with React 19, Orval,
TanStack Query, shadcn/ui, nuqs, Zustand, Biome and Vitest.

The template is optimized for frontend applications where Next.js is the
routing/composition shell, Orval is the generated transport layer and TanStack
Query owns backend server-state.

## Quick Start

```bash
cp .env.example .env   # если .env ещё нет
pnpm install
pnpm orval   # клиент из OpenAPI бэкенда (backend должен быть запущен хотя бы раз)
pnpm dev     # http://localhost:3000
```

Useful commands:

```bash
pnpm build
pnpm lint
pnpm test:run
pnpm lint:deps
pnpm orval
pnpm g:query
pnpm g:mutation
```

## Stack

| Area | Tooling |
| --- | --- |
| App shell | Next.js App Router |
| UI | React 19, shadcn/ui, Tailwind v4 |
| Backend API | Orval-generated client |
| Server-state | TanStack Query |
| URL state | nuqs |
| UI-state | Zustand |
| Validation | Zod |
| i18n | next-intl |
| Quality | Biome, dependency-cruiser |
| Tests | Vitest, React Testing Library |

## Core Rules

- Dependency direction is `app -> modules -> entities -> shared`.
- `page.tsx` stays a route adapter: it imports a scenario module and keeps
  route composition, metadata, providers and route-level concerns only.
- Modules expose public APIs through `index.ts`.
- Scenario modules may compose other modules through public APIs.
- `modules/*/ui` does not import `@/shared/api/generated` directly.
- TanStack Query owns backend server-state.
- Zustand is only for ephemeral UI-state.
- `ui/` can be split by responsibility zones, not by `smart/dumb`.

## Structure

```txt
src/
├── app/
├── modules/
│   └── users/
│       ├── model/
│       │   ├── queries/
│       │   ├── mutations/
│       │   └── stores/
│       ├── ui/
│       └── index.ts
├── entities/
│   └── user/
│       ├── model/
│       ├── lib/
│       ├── ui/
│       └── index.ts
├── shared/
│   ├── api/
│   ├── components/ui/
│   ├── lib/client/
│   ├── hooks/
│   ├── providers/
│   ├── configs/i18/
│   ├── consts/
│   └── types/
└── styles/
```

## Data Flow

```txt
UI component
↓
module model query/mutation hook
↓
shared/api/generated
↓
backend
```

User-controlled navigation state belongs in the URL through `nuqs`. For shadcn
overlays opened from tables/lists, prefer one controlled Dialog/Sheet driven by
a selected ID in the URL.

## Documentation

- [Architecture](docs/architecture.md)
- [Module Structure](docs/module-structure.md)
- [Data Flow](docs/data-flow.md)
- [Tooling](docs/tooling.md)

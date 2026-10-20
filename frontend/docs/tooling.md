# Tooling

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm lint:deps
pnpm format
pnpm orval
pnpm test:run
```

## Generators

```bash
pnpm g:module      # new module: index.ts only
pnpm g:entity      # new entity: model/schema + index.ts
pnpm g:component   # ui/<Component>.tsx
pnpm g:api         # optional api/<module>.api.ts adapter
pnpm g:query       # model/queries/use-<name>.ts + <name>.keys.ts
pnpm g:mutation    # model/mutations/use-<name>.ts
pnpm g:store       # model/stores/<name>.store.ts
```

## Environment Variables

There is no shared env facade in this frontend template.

- `NEXT_PUBLIC_API_URL` — browser API base URL for axios/Orval client.
- `ORVAL_PATH_URL` — OpenAPI schema source for Orval.

See `.env.example`.

## UI

Design system components live in `src/shared/components/ui/*` and are based on
shadcn/ui with Tailwind v4.

Add shadcn components with:

```bash
pnpx shadcn@latest add input label card dialog select
```

Feature components should use `@/shared/components/ui/*` instead of raw
`<button>`/`<input>` with repeated manual classes.

## Localization

`next-intl` is used for localization. Locales are `ru` and `kk`.

- Routing/request config: `src/shared/configs/i18/`.
- Messages: `messages/ru.json`, `messages/kk.json`.

## Testing

```bash
pnpm test
pnpm test:run
pnpm test:coverage
```

Unit/component tests live next to code in `__tests__/`.

Browser e2e tests (Playwright) live in `tests/e2e/` and run the full marketplace flow
against a running backend and frontend:

```bash
pnpm exec playwright install chromium   # once
pnpm test:e2e
```

## Quality Tools

- `pnpm lint:deps` checks dependency direction, module isolation, public APIs
  and direct generated API imports from module UI/app routes.
- `next.config.ts` connects `next-intl` and
  `output: "standalone"` for production/Docker builds.

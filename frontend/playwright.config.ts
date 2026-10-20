import { defineConfig, devices } from "@playwright/test";

/**
 * Браузерные e2e-тесты сценария сделки. Нужны запущенные бэкенд (с `pnpm db:seed`)
 * и фронтенд: `pnpm dev`, затем `pnpm test:e2e`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

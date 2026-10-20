/** Демо-аккаунты создаёт сид бэкенда (pnpm db:seed). В продакшене кнопки скрываются флагом. */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
export const DEMO_PASSWORD = "demo12345";
export const DEMO_ACCOUNTS = {
  buyer: "buyer@demo.dalago.kz",
  supplier: "supplier@demo.dalago.kz",
} as const;

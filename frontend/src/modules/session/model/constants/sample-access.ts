/** Вход без регистрации в аккаунты-примеры из сида бэкенда (pnpm db:seed). Скрывается флагом. */
export const SAMPLE_ACCESS_ENABLED =
  process.env.NEXT_PUBLIC_SAMPLE_ACCESS !== "false";

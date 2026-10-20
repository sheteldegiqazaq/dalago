/** Форматирование под язык интерфейса: kk-KZ и ru-RU, деньги в тенге. */
const intlLocale = (locale: string) => (locale === "kk" ? "kk-KZ" : "ru-RU");

export function formatNumber(locale: string, value: number) {
  return new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMoney(locale: string, value: number) {
  return `${formatNumber(locale, value)} ₸`;
}

export function formatDate(locale: string, value: string | Date) {
  const date =
    typeof value === "string" && value.length === 10
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(locale: string, value: string) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function todayIso(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 10);
}

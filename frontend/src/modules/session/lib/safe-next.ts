/** Разрешаем возврат только на внутренние пути, чтобы ?next= нельзя было использовать для редиректа на чужой сайт. */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return next;
}

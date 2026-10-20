export const MAIN_NAV: ReadonlyArray<{
  href: string;
  key: string;
  wideOnly?: boolean;
}> = [
  { href: "/catalog", key: "catalog" },
  { href: "/suppliers", key: "suppliers" },
  { href: "/requests", key: "requests" },
  { href: "/map", key: "map" },
  { href: "/open-data", key: "openData" },
  // На экранах 1280–1535px «О проекте» доступен через меню, чтобы шапка не переполнялась
  { href: "/about", key: "about", wideOnly: true },
] as const;

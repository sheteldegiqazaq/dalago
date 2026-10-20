import { QueryClient } from "@tanstack/react-query";

import { getApiStatus } from "./api-error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      // 4xx не повторяем: это ответ сервера, а не сбой сети
      retry: (failureCount, error) => {
        const status = getApiStatus(error);
        return (status === undefined || status >= 500) && failureCount < 2;
      },
      gcTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: false,
    },
  },
});

/** Инвалидирует все запросы, ключ которых начинается с пути API, например "/api/products". */
export function invalidateApi(...prefixes: string[]) {
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const key = String(query.queryKey[0] ?? "");
      return prefixes.some((prefix) => key.startsWith(prefix));
    },
  });
}

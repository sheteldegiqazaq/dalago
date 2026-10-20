"use client";

import { useQuery } from "@tanstack/react-query";

import {
  authControllerMe,
  getAuthControllerMeQueryKey,
} from "@/shared/api/generated";

import { useAuthToken } from "../use-auth-token";

export function useSession() {
  const token = useAuthToken();
  const query = useQuery({
    queryKey: getAuthControllerMeQueryKey(),
    queryFn: ({ signal }) => authControllerMe(signal),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });
  const user = token ? (query.data ?? null) : null;

  return {
    user,
    role: user?.role ?? null,
    companyId: user?.company?.id ?? null,
    isAuthenticated: Boolean(user),
    isLoading: Boolean(token) && query.isPending,
  };
}

"use client";

import { useQuery } from "@tanstack/react-query";

import {
  aiControllerStatus,
  getAiControllerStatusQueryKey,
} from "@/shared/api/generated";

export function useAiStatus() {
  return useQuery({
    queryKey: getAiControllerStatusQueryKey(),
    queryFn: ({ signal }) => aiControllerStatus(signal),
    staleTime: 5 * 60_000,
  });
}

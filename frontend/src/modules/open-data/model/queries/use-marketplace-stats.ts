"use client";

import { useQuery } from "@tanstack/react-query";

import {
  dashboardControllerStats,
  getDashboardControllerStatsQueryKey,
} from "@/shared/api/generated";

export function useMarketplaceStats() {
  return useQuery({
    queryKey: getDashboardControllerStatsQueryKey(),
    queryFn: ({ signal }) => dashboardControllerStats(signal),
  });
}

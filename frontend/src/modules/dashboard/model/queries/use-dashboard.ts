"use client";

import { useQuery } from "@tanstack/react-query";

import {
  dashboardControllerGet,
  getDashboardControllerGetQueryKey,
  getProductsControllerMineQueryKey,
  productsControllerMine,
} from "@/shared/api/generated";

export function useDashboard() {
  return useQuery({
    queryKey: getDashboardControllerGetQueryKey(),
    queryFn: ({ signal }) => dashboardControllerGet(signal),
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: getProductsControllerMineQueryKey(),
    queryFn: ({ signal }) => productsControllerMine(signal),
  });
}

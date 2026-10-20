"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  type CompaniesControllerSuppliersParams,
  companiesControllerCityStats,
  companiesControllerSupplier,
  companiesControllerSuppliers,
  getCompaniesControllerCityStatsQueryKey,
  getCompaniesControllerSupplierQueryKey,
  getCompaniesControllerSuppliersQueryKey,
} from "@/shared/api/generated";

export function useSuppliers(params: CompaniesControllerSuppliersParams) {
  return useQuery({
    queryKey: getCompaniesControllerSuppliersQueryKey(params),
    queryFn: ({ signal }) => companiesControllerSuppliers(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: getCompaniesControllerSupplierQueryKey(id),
    queryFn: ({ signal }) => companiesControllerSupplier(id, signal),
  });
}

export function useCityStats() {
  return useQuery({
    queryKey: getCompaniesControllerCityStatsQueryKey(),
    queryFn: ({ signal }) => companiesControllerCityStats(signal),
  });
}

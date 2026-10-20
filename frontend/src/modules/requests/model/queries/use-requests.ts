"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getOffersControllerMineQueryKey,
  getProductsControllerMineQueryKey,
  getRequestsControllerGetByIdQueryKey,
  getRequestsControllerListQueryKey,
  getRequestsControllerMineQueryKey,
  offersControllerMine,
  productsControllerMine,
  type RequestsControllerListParams,
  type RequestsControllerMineParams,
  requestsControllerGetById,
  requestsControllerList,
  requestsControllerMine,
} from "@/shared/api/generated";

export function useRequestsBoard(params: RequestsControllerListParams) {
  return useQuery({
    queryKey: getRequestsControllerListQueryKey(params),
    queryFn: ({ signal }) => requestsControllerList(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useMyRequests(params: RequestsControllerMineParams = {}) {
  return useQuery({
    queryKey: getRequestsControllerMineQueryKey(params),
    queryFn: ({ signal }) => requestsControllerMine(params, signal),
  });
}

export function useRequest(id: string, enabled = true) {
  return useQuery({
    queryKey: getRequestsControllerGetByIdQueryKey(id),
    queryFn: ({ signal }) => requestsControllerGetById(id, signal),
    enabled,
  });
}

export function useMyOffers(enabled = true) {
  return useQuery({
    queryKey: getOffersControllerMineQueryKey(),
    queryFn: ({ signal }) => offersControllerMine(signal),
    enabled,
  });
}

export function useMyProductsForOffer(enabled: boolean) {
  return useQuery({
    queryKey: getProductsControllerMineQueryKey(),
    queryFn: ({ signal }) => productsControllerMine(signal),
    enabled,
  });
}

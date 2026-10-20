"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getProductsControllerSearchQueryKey,
  type ProductsControllerSearchParams,
  productsControllerSearch,
} from "@/shared/api/generated";

export function useProducts(
  params: ProductsControllerSearchParams,
  enabled = true,
) {
  return useQuery({
    queryKey: getProductsControllerSearchQueryKey(params),
    queryFn: ({ signal }) => productsControllerSearch(params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

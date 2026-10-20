"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getProductsControllerGetByIdQueryKey,
  productsControllerGetById,
} from "@/shared/api/generated";

export function useProduct(id: string) {
  return useQuery({
    queryKey: getProductsControllerGetByIdQueryKey(id),
    queryFn: ({ signal }) => productsControllerGetById(id, signal),
  });
}

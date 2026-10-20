"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  aiControllerListing,
  getProductsControllerGetByIdQueryKey,
  type ProductInputDto,
  productsControllerCreate,
  productsControllerGetById,
  productsControllerUpdate,
} from "@/shared/api/generated";
import { invalidateApi } from "@/shared/lib/client";

export function useEditableProduct(id: string | undefined) {
  return useQuery({
    queryKey: getProductsControllerGetByIdQueryKey(id ?? ""),
    queryFn: ({ signal }) => productsControllerGetById(id ?? "", signal),
    enabled: Boolean(id),
  });
}

export function useSaveProduct(id: string | undefined) {
  return useMutation({
    mutationFn: (body: ProductInputDto) =>
      id ? productsControllerUpdate(id, body) : productsControllerCreate(body),
    onSuccess: () =>
      void invalidateApi("/api/products", "/api/dashboard", "/api/companies"),
  });
}

export function useListingDraft() {
  return useMutation({
    mutationFn: (text: string) => aiControllerListing({ text }),
  });
}

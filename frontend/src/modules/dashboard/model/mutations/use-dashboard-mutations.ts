"use client";

import { useMutation } from "@tanstack/react-query";

import {
  type CompanyProfileInputDto,
  companiesControllerUpdateMine,
  getAuthControllerMeQueryKey,
  productsControllerRemove,
  productsControllerSetStatus,
} from "@/shared/api/generated";
import { invalidateApi, queryClient } from "@/shared/lib/client";

export function useSetProductStatus() {
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "INACTIVE";
    }) => productsControllerSetStatus(id, { status }),
    onSuccess: () =>
      void invalidateApi("/api/products", "/api/dashboard", "/api/companies"),
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: string) => productsControllerRemove(id),
    onSuccess: () =>
      void invalidateApi("/api/products", "/api/dashboard", "/api/companies"),
  });
}

export function useUpdateCompany() {
  return useMutation({
    mutationFn: (body: CompanyProfileInputDto) =>
      companiesControllerUpdateMine(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getAuthControllerMeQueryKey(),
      });
      void invalidateApi("/api/companies");
    },
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";

import { aiControllerSearch } from "@/shared/api/generated";

export function useAiSearch() {
  return useMutation({
    mutationFn: (query: string) => aiControllerSearch({ query }),
  });
}

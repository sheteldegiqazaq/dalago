"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  getReferenceControllerGetQueryKey,
  referenceControllerGet,
} from "@/shared/api/generated";

/** Справочники меняются редко: кэшируем на всю сессию. */
export function useReference() {
  const query = useQuery({
    queryKey: getReferenceControllerGetQueryKey(),
    queryFn: ({ signal }) => referenceControllerGet(signal),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return useMemo(() => {
    const regions = query.data?.regions ?? [];
    const categories = query.data?.categories ?? [];
    const cities = regions.flatMap((region) => region.cities);

    return {
      isLoading: query.isPending,
      isError: query.isError,
      regions,
      categories,
      cities,
      categoryById: new Map(categories.map((c) => [c.id, c])),
      categoryBySlug: new Map(categories.map((c) => [c.slug, c])),
      cityById: new Map(cities.map((c) => [c.id, c])),
    };
  }, [query.data, query.isPending, query.isError]);
}

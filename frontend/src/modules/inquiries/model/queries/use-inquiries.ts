"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getInquiriesControllerGetQueryKey,
  getInquiriesControllerListQueryKey,
  inquiriesControllerGet,
  inquiriesControllerList,
} from "@/shared/api/generated";

export function useInquiries() {
  return useQuery({
    queryKey: getInquiriesControllerListQueryKey(),
    queryFn: ({ signal }) => inquiriesControllerList(signal),
  });
}

export function useInquiry(id: string) {
  return useQuery({
    queryKey: getInquiriesControllerGetQueryKey(id),
    queryFn: ({ signal }) => inquiriesControllerGet(id, signal),
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";

import {
  getInquiriesControllerGetQueryKey,
  inquiriesControllerReply,
  inquiriesControllerStart,
  type StartInquiryDto,
} from "@/shared/api/generated";
import { invalidateApi, queryClient } from "@/shared/lib/client";

export function useStartInquiry() {
  return useMutation({
    mutationFn: (body: StartInquiryDto) => inquiriesControllerStart(body),
    onSuccess: (inquiry) => {
      queryClient.setQueryData(
        getInquiriesControllerGetQueryKey(inquiry.id),
        inquiry,
      );
      void invalidateApi("/api/inquiries", "/api/dashboard");
    },
  });
}

export function useReply(inquiryId: string) {
  return useMutation({
    mutationFn: (message: string) =>
      inquiriesControllerReply(inquiryId, { message }),
    onSuccess: (inquiry) => {
      queryClient.setQueryData(
        getInquiriesControllerGetQueryKey(inquiryId),
        inquiry,
      );
      void invalidateApi("/api/inquiries");
    },
  });
}

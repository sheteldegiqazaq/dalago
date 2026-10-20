"use client";

import { useMutation } from "@tanstack/react-query";

import {
  getRequestsControllerGetByIdQueryKey,
  type OfferInputDto,
  offersControllerAccept,
  offersControllerReject,
  offersControllerUpdate,
  type RequestInputDto,
  requestsControllerClose,
  requestsControllerCreate,
  requestsControllerOffer,
  requestsControllerUpdate,
} from "@/shared/api/generated";
import { invalidateApi, queryClient } from "@/shared/lib/client";

const refreshProcurement = () =>
  invalidateApi("/api/requests", "/api/offers", "/api/dashboard");

export function useCreateRequest() {
  return useMutation({
    mutationFn: (body: RequestInputDto) => requestsControllerCreate(body),
    onSuccess: (request) => {
      queryClient.setQueryData(
        getRequestsControllerGetByIdQueryKey(request.id),
        request,
      );
      void refreshProcurement();
    },
  });
}

export function useUpdateRequest(id: string) {
  return useMutation({
    mutationFn: (body: RequestInputDto) => requestsControllerUpdate(id, body),
    onSuccess: (request) => {
      queryClient.setQueryData(
        getRequestsControllerGetByIdQueryKey(id),
        request,
      );
      void refreshProcurement();
    },
  });
}

export function useCloseRequest(id: string) {
  return useMutation({
    mutationFn: () => requestsControllerClose(id),
    onSuccess: (request) => {
      queryClient.setQueryData(
        getRequestsControllerGetByIdQueryKey(id),
        request,
      );
      void refreshProcurement();
    },
  });
}

export function useDecideOffer(requestId: string) {
  return useMutation({
    mutationFn: ({
      offerId,
      decision,
    }: {
      offerId: string;
      decision: "accept" | "reject";
    }) =>
      decision === "accept"
        ? offersControllerAccept(offerId)
        : offersControllerReject(offerId),
    onSuccess: (request) => {
      queryClient.setQueryData(
        getRequestsControllerGetByIdQueryKey(requestId),
        request,
      );
      void refreshProcurement();
    },
  });
}

export function useSubmitOffer(requestId: string, offerId: string | null) {
  return useMutation({
    mutationFn: (body: OfferInputDto) =>
      offerId
        ? offersControllerUpdate(offerId, body)
        : requestsControllerOffer(requestId, body),
    onSuccess: () => void refreshProcurement(),
  });
}

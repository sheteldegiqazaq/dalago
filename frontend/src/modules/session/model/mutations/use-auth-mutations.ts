"use client";

import { useMutation } from "@tanstack/react-query";

import {
  type AuthResponseDto,
  authControllerSignIn,
  authControllerSignUp,
  getAuthControllerMeQueryKey,
  type LoginDto,
  type RegisterDto,
} from "@/shared/api/generated";
import { authToken, queryClient } from "@/shared/lib/client";

function startSession(response: AuthResponseDto) {
  authToken.set(response.accessToken);
  queryClient.setQueryData(getAuthControllerMeQueryKey(), response.user);
  // Данные кабинета и права в карточках зависят от пользователя
  void queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] !== getAuthControllerMeQueryKey()[0],
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginDto) => authControllerSignIn(body),
    onSuccess: startSession,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterDto) => authControllerSignUp(body),
    onSuccess: startSession,
  });
}

export function logout() {
  authToken.clear();
  queryClient.clear();
}

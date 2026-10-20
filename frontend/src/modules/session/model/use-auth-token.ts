"use client";

import { useSyncExternalStore } from "react";

import { authToken } from "@/shared/lib/client";

export function useAuthToken() {
  return useSyncExternalStore(authToken.subscribe, authToken.get, () => null);
}

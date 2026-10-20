"use client";

/**
 * Access-токен хранится в localStorage (MVP без refresh-токенов).
 * Подписка нужна, чтобы UI реагировал на вход/выход без перезагрузки.
 */
const STORAGE_KEY = "dalago.token";
const listeners = new Set<() => void>();

function read(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export const authToken = {
  get: read,
  set(token: string) {
    try {
      window.localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // приватный режим браузера: токен живёт до перезагрузки страницы
    }
    notify();
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        listener();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

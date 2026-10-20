import axios from "axios";

/**
 * Стабильный код ошибки бэкенда (например, REQUEST_NOT_ACTIVE) для перевода на kk/ru.
 * Сообщения бэкенда не показываем напрямую — они только на русском.
 */
export function getApiErrorCode(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "UNKNOWN";
  }

  if (!error.response) {
    return "NETWORK";
  }

  const data = error.response.data as
    | { code?: unknown; message?: unknown }
    | undefined;

  if (typeof data?.code === "string") {
    return data.code;
  }

  if (error.response.status === 400) {
    return "VALIDATION";
  }

  if (error.response.status === 401) {
    return "UNAUTHORIZED";
  }

  if (error.response.status === 403) {
    return "FORBIDDEN";
  }

  return "UNKNOWN";
}

export function getApiStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

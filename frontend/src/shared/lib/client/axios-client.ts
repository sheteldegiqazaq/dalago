import axios from "axios";

import { authToken } from "./auth-token";

export const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
});

axiosApi.interceptors.request.use((config) => {
  const token = authToken.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Просроченный или чужой токен: выходим, но не уводим со страницы —
    // публичные разделы продолжают работать, а защищённые покажут вход.
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      authToken.get()
    ) {
      const isLogin = error.config?.url?.includes("/auth/login");

      if (!isLogin) {
        authToken.clear();
      }
    }

    return Promise.reject(error);
  },
);

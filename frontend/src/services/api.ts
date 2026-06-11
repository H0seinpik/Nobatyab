import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useLoadingStore } from "@/stores/loading";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
const SKIP_LOADING_HEADER = "X-Skip-Global-Loading";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = localStorage.getItem("accessToken");
let refreshToken: string | null = localStorage.getItem("refreshToken");

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem("accessToken", access);
  else localStorage.removeItem("accessToken");
  if (refresh) localStorage.setItem("refreshToken", refresh);
  else localStorage.removeItem("refreshToken");
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (config.headers[SKIP_LOADING_HEADER] !== "true") {
    useLoadingStore().start();
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

function stopGlobalLoading(config?: InternalAxiosRequestConfig) {
  if (config?.headers?.[SKIP_LOADING_HEADER] !== "true") {
    useLoadingStore().stop();
  }
}

api.interceptors.response.use(
  (res) => {
    stopGlobalLoading(res.config);
    return res;
  },
  async (error: AxiosError) => {
    stopGlobalLoading(error.config);
    const original = error.config;
    if (!original || error.response?.status !== 401 || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (!refreshToken) return Promise.reject(error);

    if (!refreshPromise) {
      refreshPromise = api
        .post("/auth/refresh", { refreshToken })
        .then((res) => {
          const data = res.data.data;
          setTokens(data.accessToken, data.refreshToken);
          return data.accessToken as string;
        })
        .catch(() => {
          setTokens(null, null);
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    if (!newToken) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  },
);

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: { skipGlobalLoading?: boolean },
) {
  const res = await api.get<ApiResponse<T>>(url, {
    params,
    headers: options?.skipGlobalLoading ? { [SKIP_LOADING_HEADER]: "true" } : undefined,
  });
  return res.data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data;
}

export async function apiPut<T>(url: string, body?: unknown) {
  const res = await api.put<ApiResponse<T>>(url, body);
  return res.data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const res = await api.patch<ApiResponse<T>>(url, body);
  return res.data;
}

export async function apiDelete<T>(url: string) {
  const res = await api.delete<ApiResponse<T>>(url);
  return res.data;
}

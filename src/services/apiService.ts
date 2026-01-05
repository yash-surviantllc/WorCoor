import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import type { AuthData } from "@/src/utils/AuthContext";
import localStorageService from "@/src/services/localStorageService";
import { getAuthContext } from "@/src/utils/AuthContextProviderForApi";

interface RequestOptions {
  path: string;
  isAuth?: boolean;
  refreshToken?: boolean;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  // if Media
  isImage?: boolean;
  dp?: string;
  df?: Record<string, any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 🔑 in-memory token cache (always up-to-date after login/refresh)
let currentAccessToken: string | null = null;

// called by AuthContext after login/refresh
const setAuthToken = (token: string) => {
  currentAccessToken = token;
};

const clearAuthToken = () => {
  currentAccessToken = null;
};

const getAuthHeaders = (options: RequestOptions) => {
  const headers: Record<string, string> = {};
  const authData = localStorageService.getItem<AuthData>("authData");

  const token = currentAccessToken || authData?.accessToken;

  if (options.isAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.refreshToken && authData?.refreshToken) {
    headers["x-refresh-token"] = authData.refreshToken;
  }

  if (options.isImage) {
    if (options.dp) {
      headers["dp"] = options.dp;
    }
    if (options.df) {
      headers["df"] = JSON.stringify(options.df);
    }
  }

  return {
    ...headers,
    ...(options.headers || {}),
  };
};

const request = async <T = any>(
  options: RequestOptions
): Promise<AxiosResponse<T>> => {
  const config: AxiosRequestConfig = {
    url: API_BASE_URL + options.path,
    method: options.method || "GET",
    headers: getAuthHeaders(options),
    params: options.params,
    data: options.data,
  };

  try {
    const response = await axios(config);
    return response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized – logging out user");

      // Call AuthContext logout if available
      const authContext = getAuthContext();
      if (authContext) {
        authContext.authLogout();
      } else {
        // fallback if context not mounted
        localStorageService.removeItem("authData");
        clearAuthToken();
        window.location.href = "/login";
      }
    }
    throw error;
  }
};

export const apiService = {
  get: (options: RequestOptions) => request({ ...options, method: "GET" }),
  post: (options: RequestOptions) => request({ ...options, method: "POST" }),
  put: (options: RequestOptions) => request({ ...options, method: "PUT" }),
  delete: (options: RequestOptions) => request({ ...options, method: "DELETE" }),
  patch: (options: RequestOptions) => request({ ...options, method: "PATCH" }),
  setAuthToken,   // 👈 use after login/refresh
  clearAuthToken, // 👈 use after logout
};

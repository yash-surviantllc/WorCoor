import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuthContext } from "@/src/utils/AuthContextProviderForApi";

interface RequestOptions {
  path: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  isImage?: boolean;
  dp?: string;
  df?: Record<string, any>;
}

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/")
  ? RAW_API_BASE_URL.slice(0, RAW_API_BASE_URL.length - 1)
  : RAW_API_BASE_URL;

const request = async <T = any>(
  options: RequestOptions
): Promise<AxiosResponse<T>> => {
  const normalizedPath = options.path.startsWith("/") ? options.path : `/${options.path}`;

  const config: AxiosRequestConfig = {
    url: `${API_BASE_URL}${normalizedPath}`,
    method: options.method || "GET",
    headers: options.headers,
    params: options.params,
    data: options.data,
    withCredentials: true,
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
};

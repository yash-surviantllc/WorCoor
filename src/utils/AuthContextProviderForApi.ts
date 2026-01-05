import { AuthData, AuthContextType } from "./AuthContext";
import { apiService } from "@/src/services/apiService";
import localStorageService from "@/src/services/localStorageService";
import { api_url } from "@/src/constants/api_url";

// ---- Global bridge so apiService can call logout ----
let authContextRef: AuthContextType | null = null;

export const setAuthContext = (context: AuthContextType | null) => {
  authContextRef = context;
};

export const getAuthContext = () => authContextRef;
// -----------------------------------------------------

export const useApiAuthProvider = () => {
  const getAuthData = (): AuthData | null => {
    return localStorageService.getItem<AuthData>("authData") || null;
  };

  const getAuthHeaders = (): Record<string, string> => {
    const authData = getAuthData();
    if (!authData?.accessToken) return {};
    return {
      Authorization: `Bearer ${authData.accessToken}`,
    };
  };

  const callApi = async (options: { path: string; method?: string; body?: any }) => {
    const headers = getAuthHeaders();
    const method = (options.method || "GET").toLowerCase();

    switch (method) {
      case "get":
        return apiService.get({ path: options.path, isAuth: true, headers });
      case "post":
        return apiService.post({ path: options.path, data: options.body, isAuth: true, headers });
      case "put":
        return apiService.put({ path: options.path, data: options.body, isAuth: true, headers });
      case "patch":
        return apiService.patch({ path: options.path, data: options.body, isAuth: true, headers });
      case "delete":
        return apiService.delete({ path: options.path, isAuth: true, headers });
      default:
        throw new Error(`Unsupported method: ${options.method}`);
    }
  };

  const refreshTokenApi = async () => {
    const authData = getAuthData();
    if (!authData?._id) return null;

    return apiService.put({
      path: `${api_url.authServices.refreshToken}?id=${authData._id}`,
      isAuth: true,
      refreshToken: true,
    });
  };

  return { callApi, refreshTokenApi };
};

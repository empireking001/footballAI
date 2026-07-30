import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Sends the httpOnly refresh cookie cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach current access token from Zustand to outgoing requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    return data?.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

// On a 401, attempt exactly one silent refresh-and-retry per request.
// Concurrent 401s share a single in-flight refresh call.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Guard: Prevent auth routes (login, refresh, register) from triggering a retry cycle on 401
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      // Safely queue concurrent requests onto the exact same in-flight refresh request
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, newToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      // If refresh fails (cookie missing/expired), reset auth state
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  },
);

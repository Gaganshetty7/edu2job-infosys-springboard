import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`, 
  withCredentials: true, 
});

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); 
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token refresh already in progress - queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Attempt token refresh with 15-second timeout
      const refreshTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Token refresh timeout")), 15000)
      );

      try {
        const refreshToken = localStorage.getItem("refresh");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Race between refresh request and timeout
        const refreshResponse: any = await Promise.race([
          api.post("/accounts/token/refresh/", { refresh: refreshToken }),
          refreshTimeout,
        ]);

        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem("access", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        // Process queued requests with new token
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed or timed out - clear tokens and redirect to login
        console.error("Token refresh failed:", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        processQueue(err, null);
        isRefreshing = false;

        // Silent redirect to login
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/accounts/login/", { email, password });
  return res.data; 
};

export const registerUser = async (payload: { name: string; email: string; password: string }) => {
  const res = await api.post("/accounts/register/", payload);
  return res.data; 
};

export const refreshToken = async (refresh: string) => {
  const res = await api.post("/accounts/token/refresh/", { refresh });
  return res.data;
};

// Setter to update token in interceptors (called from AuthContext)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;

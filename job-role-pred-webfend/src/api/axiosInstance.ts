import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
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

// Handle 401 errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem("refresh");

      if (!refreshTokenValue) {
        // No refresh token, clear everything and redirect to login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        processQueue(error, null);
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${api.defaults.baseURL}/accounts/token/refresh/`,
          { refresh: refreshTokenValue },
          { withCredentials: true }
        );

        const { access } = response.data;

        // Update tokens
        localStorage.setItem("access", access);

        // Update default header
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        // Process queued requests
        processQueue(null, access);

        // Update the original request header and retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
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

export default api;

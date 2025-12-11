import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
  withCredentials: true, 
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); 
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

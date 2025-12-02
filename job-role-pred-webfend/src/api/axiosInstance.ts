import axios from 'axios';

// created axios instance with base URL and withCredentials for cookie handling

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
});

//attaching access token from AuthContext automatically for all requests
export const attachToken = (token: string | null) => {
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : "";
};

export default api;


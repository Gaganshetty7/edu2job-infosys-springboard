const API_BASE_URL = import.meta.env.VITE_API_BASE;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE is not defined");
}

export { API_BASE_URL };

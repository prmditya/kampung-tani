import axios from "axios";

const apiClient = axios.create({
  // backend uses /api/v1 as API prefix
  baseURL: process.env.BACKEND_API_URL || "http://192.168.1.26:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // make headers object safe to mutate and add Authorization if token exists
  const token = localStorage.getItem("token");
  config.headers = config.headers ?? {};
  if (token) {
    // cast to any to avoid TS complaining about index signature
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

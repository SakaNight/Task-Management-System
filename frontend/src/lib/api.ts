import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // ✅ 后端服务地址
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {}; // ✅ 确保 headers 存在
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
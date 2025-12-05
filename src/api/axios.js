import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    try {
      const { data } = await api.get("/api/csrf");
      config.headers["X-CSRF-Token"] = data.csrfToken;
    } catch (err) {
      console.error("CSRF fetch failed", err);
    }
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
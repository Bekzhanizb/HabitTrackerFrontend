// src/api/axios.js
import axios from "axios";
import { API_BASE } from "../config";

const api = axios.create({
    baseURL: API_BASE,       // например "http://localhost:8080"
    timeout: 20000,
});

// 🔥 Автоматически добавляем Bearer-токен ко всем запросам
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

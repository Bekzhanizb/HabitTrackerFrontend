// src/api/axios.js
import axios from "axios";
import { API_BASE } from "../config";

const api = axios.create({
    baseURL: API_BASE,      // "http://localhost:8080"
    withCredentials: true,  // чтобы куки ходили
});

api.interceptors.request.use((config) => {
    // JWT из localStorage
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF-токен (если используешь)
    const csrf = localStorage.getItem("csrf_token");
    if (csrf) {
        config.headers["X-CSRF-Token"] = csrf;
    }

    return config;
});

export default api;

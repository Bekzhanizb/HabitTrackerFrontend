import axios from "axios";
import { API_BASE } from "../config";

const api = axios.create({
    baseURL: API_BASE,
    timeout: 20000,
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch {
        // ignore
    }
    return config;
});

export default api;

import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
    baseURL: 'http://localhost:8080', // Убедитесь, что это правильный URL вашего backend
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 секунд
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
            hasToken: !!token
        });
        
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor для обработки ответов
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
        });
        
        // Если токен невалиден (401), перенаправляем на логин
        if (error.response?.status === 401) {
            console.warn('🔒 Unauthorized - redirecting to login');
            
            // Очищаем токен и пользователя
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Перенаправляем на страницу входа (если не уже там)
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
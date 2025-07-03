import { useCookies } from '@/hooks/use-cookies';
import axios from 'axios';

const { getCookie, removeCookie } = useCookies();

// Create an axios instance
export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = getCookie('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Unauthorized) errors
        if (error.response && error.response.status === 401) {
            removeCookie('accessToken');
            window.location.href = '/admin/auth/login';
        }
        return Promise.reject(error);
    },
);

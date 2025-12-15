import axios from "axios";
import { store } from "@/store";
import { API_URL } from "@env";
import { clearUser } from "@/reducers/userSlice";
import { router } from "expo-router";

/**
 * Lấy baseURL từ environment hoặc fallback
 * Ưu tiên: API_URL từ .env > __DEV__ check > Production default
 */
const getBaseURL = (): string => {
    // Ưu tiên sử dụng API_URL từ .env
    if (API_URL && API_URL.trim() !== '') {
        // Đảm bảo có /api ở cuối
        const url = API_URL.trim();
        return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
    }

    // Fallback dựa trên __DEV__
    if (__DEV__) {
        return 'http://localhost:8000/api';
    }

    // Production default
    return 'https://skysend.betech-digital.com/api';
};

const baseURL = getBaseURL();
console.log('🌐 API BaseURL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để gắn token vào header
api.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const user = state.user;

        if (user?.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
        }

        // Nếu là FormData, không set Content-Type để axios tự động set với boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor xử lý response - Xử lý 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Xử lý lỗi 401 (Unauthorized)
        if (error.response?.status === 401) {
            // Clear user từ Redux store
            store.dispatch(clearUser());

            // Redirect về login
            // Note: Không check route hiện tại vì expo-router không expose pathname trong interceptor
            router.replace('/login');
        }

        return Promise.reject(error);
    }
);

export default api;
import axios from "axios";
import { store } from "@/store"; // import store trực tiếp

// Tạo instance axios
const api = axios.create({
    baseURL: "http://192.168.1.10:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để gắn token vào header
api.interceptors.request.use(
    (config) => {
        // Lấy user từ Redux store
        const state = store.getState();
        const user = state.user; // giả sử user lưu ở state.user

        if (user?.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor xử lý response
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;

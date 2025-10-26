import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Nếu bạn sử dụng AsyncStorage
import Config from 'react-native-config';

// Tạo một instance của axios với base URL từ .env
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm Interceptor cho mỗi request để gắn token vào header
api.interceptors.request.use(
    async (config) => {
        // Lấy user từ AsyncStorage
        const user = await AsyncStorage.getItem('user');

        if (user) {
            // Parse dữ liệu user từ chuỗi JSON
            const parsedUser = JSON.parse(user);

            // Lấy token từ đối tượng user
            const token = parsedUser?.token;

            if (token) {
                // Nếu có token thì thêm vào header Authorization
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return config; // Trả về config đã cập nhật
    },
    (error) => {
        return Promise.reject(error); // Trả về lỗi nếu có
    }
);

// Cấu hình interceptor để xử lý phản hồi của API
api.interceptors.response.use(
    (response) => response, // Chỉ trả về response nếu không có lỗi
    (error) => {
        // Xử lý lỗi nếu có (như token hết hạn, v.v.)
        return Promise.reject(error);
    }
);

export default api;

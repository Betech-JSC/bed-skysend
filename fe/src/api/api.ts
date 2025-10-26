import axios from "axios";
import Config from 'react-native-config';

// Create axios instance with base URL from .env
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// You can create interceptors to handle the API response globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

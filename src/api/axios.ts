import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// Tạo axios instance với cấu hình mặc định
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Thêm token vào mọi request
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi chung
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('authToken');
                    window.location.href = '/';
                    break;
                case 403:
                    message.error('Bạn không có quyền truy cập.');
                    break;
                case 404:
                    message.error('Không tìm thấy tài nguyên.');
                    break;
                case 500:
                    message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
                    break;
                default:
                    message.error((data as any)?.message || 'Đã xảy ra lỗi.');
            }
        } else if (error.request) {
            message.error('Không thể kết nối đến máy chủ.');
        } else {
            message.error('Đã xảy ra lỗi không xác định.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;

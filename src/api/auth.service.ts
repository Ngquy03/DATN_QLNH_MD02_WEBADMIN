import apiClient from './axios';
import { ApiResponse } from './types';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        role: string;
    };
}

export const authService = {
    // Đăng nhập
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/users/login', credentials);
        return response.data.data;
    },

    // Đăng xuất
    logout: async (): Promise<void> => {
        await apiClient.post('/users/logout');
        localStorage.removeItem('authToken');
    },

    // Kiểm tra token
    verifyToken: async (): Promise<boolean> => {
        try {
            await apiClient.get('/users/verify');
            return true;
        } catch {
            return false;
        }
    },
};


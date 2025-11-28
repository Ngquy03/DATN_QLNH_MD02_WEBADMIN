import apiClient from './axios';
import { ApiResponse } from './types';

export interface User {
    id: string;
    username: string;
    email?: string;
    role: string;
    name?: string;
    phoneNumber?: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    email?: string;
    role: string;
    name?: string;
    phoneNumber?: string;
}

export interface UpdateUserRequest {
    email?: string;
    role?: string;
    name?: string;
    phoneNumber?: string;
    isActive?: boolean;
}

// Helper function to map _id to id
const mapUser = (item: any): User => ({
    ...item,
    id: item._id || item.id,
});

export const userService = {
    // Lấy danh sách users
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/users');
        return response.data.data.map(mapUser);
    },

    // Lấy thông tin user theo ID
    getById: async (id: string): Promise<User> => {
        const response = await apiClient.get<ApiResponse<any>>(`/users/${id}`);
        return mapUser(response.data.data);
    },

    // Tạo user mới
    create: async (data: CreateUserRequest): Promise<User> => {
        const response = await apiClient.post<ApiResponse<any>>('/users', data);
        return mapUser(response.data.data);
    },

    // Cập nhật user
    update: async (id: string, data: UpdateUserRequest): Promise<User> => {
        const response = await apiClient.put<ApiResponse<any>>(`/users/${id}`, data);
        return mapUser(response.data.data);
    },

    // Xóa user
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};


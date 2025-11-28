import apiClient from './axios';
import { ApiResponse } from './types';

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    image?: string;
    status?: string;
    createdAt?: string;
}

export interface CreateMenuItemRequest {
    name: string;
    description?: string;
    price: number;
    category?: string;
    image?: string;
}

export interface UpdateMenuItemRequest {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    status?: string;
}

// Helper function to map _id to id
const mapMenuItem = (item: any): MenuItem => ({
    ...item,
    id: item._id || item.id,
});

export const menuService = {
    // Lấy danh sách menu items
    getAll: async (): Promise<MenuItem[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/menu');
        return response.data.data.map(mapMenuItem);
    },

    // Lấy thông tin menu item theo ID
    getById: async (id: string): Promise<MenuItem> => {
        const response = await apiClient.get<ApiResponse<any>>(`/menu/${id}`);
        return mapMenuItem(response.data.data);
    },

    // Tạo menu item mới
    create: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
        const response = await apiClient.post<ApiResponse<any>>('/menu', data);
        return mapMenuItem(response.data.data);
    },

    // Cập nhật menu item
    update: async (id: string, data: UpdateMenuItemRequest): Promise<MenuItem> => {
        const response = await apiClient.put<ApiResponse<any>>(`/menu/${id}`, data);
        return mapMenuItem(response.data.data);
    },

    // Xóa menu item
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/menu/${id}`);
    },
};


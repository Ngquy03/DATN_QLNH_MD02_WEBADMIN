import apiClient from './axios';
import { ApiResponse } from './types';

export interface Ingredient {
    id: string;
    name: string;
    tag?: string;
    unit: string;
    quantity: number;
    category?: string;
    minThreshold?: number;
    importPrice?: number;
    price?: number;
    supplier?: string;
    status?: string;
    image?: string;
    description?: string;
    lastRestocked?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateIngredientRequest {
    name: string;
    category?: string;
    tag?: string;
    unit: string;
    quantity: number;
    minThreshold?: number;
    importPrice?: number;
    price?: number;
    supplier?: string;
    image?: string;
    description?: string;
}

export interface UpdateIngredientRequest {
    name?: string;
    category?: string;
    tag?: string;
    unit?: string;
    quantity?: number;
    minThreshold?: number;
    importPrice?: number;
    price?: number;
    supplier?: string;
    status?: string;
    image?: string;
    description?: string;
}

// Helper function to map _id to id
const mapIngredient = (item: any): Ingredient => ({
    ...item,
    id: item._id || item.id,
});

export const ingredientService = {
    // Lấy danh sách ingredients
    getAll: async (): Promise<Ingredient[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/ingredients');
        return response.data.data.map(mapIngredient);
    },

    // Lấy thông tin ingredient theo ID
    getById: async (id: string): Promise<Ingredient> => {
        const response = await apiClient.get<ApiResponse<any>>(`/ingredients/${id}`);
        return mapIngredient(response.data.data);
    },

    // Tạo ingredient mới
    create: async (data: CreateIngredientRequest): Promise<Ingredient> => {
        const response = await apiClient.post<ApiResponse<any>>('/ingredients', data);
        return mapIngredient(response.data.data);
    },

    // Cập nhật ingredient
    update: async (id: string, data: UpdateIngredientRequest): Promise<Ingredient> => {
        const response = await apiClient.put<ApiResponse<any>>(`/ingredients/${id}`, data);
        return mapIngredient(response.data.data);
    },

    // Xóa ingredient
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/ingredients/${id}`);
    },

    // Lấy danh sách nguyên liệu cảnh báo (sắp hết/hết hàng)
    getWarnings: async (): Promise<Ingredient[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/ingredients/warnings');
        return response.data.data.map(mapIngredient);
    },
};


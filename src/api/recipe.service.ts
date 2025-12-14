import apiClient from './axios';
import { ApiResponse } from './types';

export interface RecipeIngredient {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
}

export interface RecipeInstruction {
    step: number;
    description: string;
    image?: string;
    duration?: number;
}

export interface Recipe {
    id: string;
    _id?: string;
    menuItemId: string;
    menuItemName: string;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    preparationTime: number;
    cookingTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    notes?: string;
    tips?: string[];
    category?: string;
    tags?: string[];
    image?: string;
    video?: string;
    status: 'active' | 'inactive' | 'draft';
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateRecipeRequest {
    menuItemId: string;
    menuItemName: string;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    preparationTime?: number;
    cookingTime?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    notes?: string;
    tips?: string[];
    category?: string;
    tags?: string[];
    image?: string;
    video?: string;
    status?: 'active' | 'inactive' | 'draft';
    createdBy?: string;
}

export interface UpdateRecipeRequest {
    menuItemId?: string;
    menuItemName?: string;
    ingredients?: RecipeIngredient[];
    instructions?: RecipeInstruction[];
    preparationTime?: number;
    cookingTime?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    notes?: string;
    tips?: string[];
    category?: string;
    tags?: string[];
    image?: string;
    video?: string;
    status?: 'active' | 'inactive' | 'draft';
    updatedBy?: string;
}

export interface IngredientAvailability {
    ingredientId: string;
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
    isAvailable: boolean;
}

export interface IngredientCheckResponse {
    recipeId: string;
    recipeName: string;
    servings: number;
    allAvailable: boolean;
    ingredients: IngredientAvailability[];
}

const mapRecipe = (item: any): Recipe => ({
    ...item,
    id: item._id || item.id,
});

export const recipeService = {
    getAll: async (params?: {
        status?: string;
        category?: string;
        difficulty?: string;
        menuItemId?: string;
    }): Promise<Recipe[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/recipes', { params });
        return response.data.data.map(mapRecipe);
    },

    getById: async (id: string): Promise<Recipe> => {
        const response = await apiClient.get<ApiResponse<any>>(`/recipes/${id}`);
        return mapRecipe(response.data.data);
    },

    getByMenuItemId: async (menuItemId: string): Promise<Recipe> => {
        const response = await apiClient.get<ApiResponse<any>>(`/recipes/menu/${menuItemId}`);
        return mapRecipe(response.data.data);
    },

    create: async (data: CreateRecipeRequest): Promise<Recipe> => {
        const response = await apiClient.post<ApiResponse<any>>('/recipes', data);
        return mapRecipe(response.data.data);
    },

    update: async (id: string, data: UpdateRecipeRequest): Promise<Recipe> => {
        const response = await apiClient.put<ApiResponse<any>>(`/recipes/${id}`, data);
        return mapRecipe(response.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/recipes/${id}`);
    },

    getTotalTime: async (id: string): Promise<{
        preparationTime: number;
        cookingTime: number;
        totalTime: number;
    }> => {
        const response = await apiClient.get<ApiResponse<any>>(`/recipes/${id}/total-time`);
        return response.data.data;
    },

    checkIngredients: async (id: string, servings?: number): Promise<IngredientCheckResponse> => {
        const response = await apiClient.get<ApiResponse<any>>(`/recipes/${id}/check-ingredients`, {
            params: { servings }
        });
        return response.data.data;
    },
};

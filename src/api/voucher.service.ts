import apiClient from './axios';

export interface Voucher {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateVoucherRequest {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    description?: string;
}

export interface UpdateVoucherRequest {
    code?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    minOrderValue?: number;
    maxDiscount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    isActive?: boolean;
    description?: string;
}

export interface ValidateVoucherRequest {
    code: string;
    orderValue: number;
}

export interface ValidateVoucherResponse {
    voucher: Voucher;
    discountAmount: number;
    finalAmount: number;
}

export const voucherService = {
    // Lấy tất cả voucher
    getAll: async (): Promise<{ data: Voucher[]; count: number }> => {
        const response = await apiClient.get<{ success: boolean; data: Voucher[]; count: number }>('/vouchers');
        return { data: response.data.data, count: response.data.count || 0 };
    },

    // Lấy voucher theo ID
    getById: async (id: string): Promise<Voucher> => {
        const response = await apiClient.get<{ success: boolean; data: Voucher }>(`/vouchers/${id}`);
        return response.data.data;
    },

    // Tạo voucher mới
    create: async (data: CreateVoucherRequest): Promise<Voucher> => {
        const response = await apiClient.post<{ success: boolean; data: Voucher }>('/vouchers', data);
        return response.data.data;
    },

    // Validate voucher
    validate: async (data: ValidateVoucherRequest): Promise<ValidateVoucherResponse> => {
        const response = await apiClient.post<{ success: boolean; data: ValidateVoucherResponse }>('/vouchers/validate', data);
        return response.data.data;
    },

    // Áp dụng voucher
    apply: async (code: string): Promise<Voucher> => {
        const response = await apiClient.post<{ success: boolean; data: Voucher }>('/vouchers/apply', { code });
        return response.data.data;
    },

    // Cập nhật voucher
    update: async (id: string, data: UpdateVoucherRequest): Promise<Voucher> => {
        const response = await apiClient.put<{ success: boolean; data: Voucher }>(`/vouchers/${id}`, data);
        return response.data.data;
    },

    // Xóa voucher
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/vouchers/${id}`);
    },
};

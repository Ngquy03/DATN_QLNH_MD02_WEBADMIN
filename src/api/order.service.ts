import apiClient from './axios';

export interface Order {
    _id: string;
    tableId: string;
    tableName?: string;
    items: OrderItem[];
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    totalAmount: number;
    discount?: number;
    finalAmount: number;
    paymentMethod?: string;
    paymentStatus?: 'unpaid' | 'paid' | 'partial';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    mergedFrom?: string[];
    splitTo?: string[];
    tableCheckRequested?: boolean;
    tableCheckRequestedAt?: string;
}

export interface OrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    status?: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface CreateOrderRequest {
    tableId: string;
    items: OrderItem[];
    notes?: string;
}

export interface UpdateOrderRequest {
    items?: OrderItem[];
    status?: string;
    notes?: string;
    tableCheckRequested?: boolean;
}

export interface SplitOrderRequest {
    splits: {
        items: { menuItemId: string; quantity: number }[];
        discount?: number;
        paymentMethod?: string;
    }[];
}

export const orderService = {
    // Lấy tất cả orders
    getAll: async (params?: { status?: string; tableId?: string }): Promise<Order[]> => {
        const response = await apiClient.get<{ success: boolean; data: Order[] }>('/orders', { params });
        return response.data.data;
    },

    // Lấy order theo ID
    getById: async (id: string): Promise<Order> => {
        const response = await apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
        return response.data.data;
    },

    // Tạo order mới
    create: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await apiClient.post<{ success: boolean; data: Order }>('/orders', data);
        return response.data.data;
    },

    // Cập nhật order
    update: async (id: string, data: UpdateOrderRequest): Promise<Order> => {
        const response = await apiClient.put<{ success: boolean; data: Order }>(`/orders/${id}`, data);
        return response.data.data;
    },

    // Xóa order
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/orders/${id}`);
    },

    // Yêu cầu kiểm tra bàn
    requestTableCheck: async (orderId: string): Promise<Order> => {
        const response = await apiClient.put<{ success: boolean; data: Order }>(
            `/orders/${orderId}`,
            { tableCheckRequested: true }
        );
        return response.data.data;
    },

    // Tách order/hóa đơn
    split: async (orderId: string, data: SplitOrderRequest): Promise<{ originalOrderId: string; newOrders: Order[] }> => {
        const response = await apiClient.post<{
            success: boolean;
            data: { originalOrderId: string; newOrders: Order[] }
        }>(
            `/cashier/invoices/${orderId}/split`,
            data
        );
        return response.data.data;
    },
};

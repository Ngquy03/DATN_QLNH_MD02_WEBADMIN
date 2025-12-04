import apiClient from './axios';

export interface Table {
    _id: string;
    tableNumber: number;
    capacity: number;
    floor: number;
    status: 'available' | 'occupied' | 'reserved';
    currentOrderId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTableRequest {
    tableNumber: number;
    capacity: number;
    floor: number;
    status?: 'available' | 'occupied' | 'reserved';
}

export interface UpdateTableRequest {
    tableNumber?: number;
    capacity?: number;
    floor?: number;
    status?: 'available' | 'occupied' | 'reserved';
    currentOrderId?: string;
}

// Helper function to map API response to Table interface
const mapTable = (item: any): Table => {
    let floor = item.floor;
    if (floor === undefined && item.location) {
        // Try to parse floor from location string "Tầng X"
        const match = item.location.match(/Tầng\s*(\d+)/i);
        if (match) {
            floor = parseInt(match[1], 10);
        } else {
            // Fallback if location format is different or just a number string
            floor = parseInt(item.location, 10) || 1;
        }
    }
    return {
        ...item,
        floor: floor || 1, // Default to floor 1 if parsing fails
    };
};

export const tableService = {
    // Lấy tất cả bàn
    getAll: async (params?: { floor?: number; status?: string }): Promise<{ data: Table[]; count: number }> => {
        const response = await apiClient.get<{ success: boolean; data: any[]; count: number }>('/tables', { params });
        const mappedData = Array.isArray(response.data.data) ? response.data.data.map(mapTable) : [];
        return { data: mappedData, count: response.data.count || 0 };
    },

    // Lấy bàn theo ID
    getById: async (id: string): Promise<Table> => {
        const response = await apiClient.get<{ success: boolean; data: any }>(`/tables/${id}`);
        return mapTable(response.data.data);
    },

    // Tạo bàn mới
    create: async (data: CreateTableRequest): Promise<Table> => {
        // Map floor back to location for API if needed, or send both
        const payload = {
            ...data,
            location: `Tầng ${data.floor}`,
        };
        const response = await apiClient.post<{ success: boolean; data: any }>('/tables', payload);
        return mapTable(response.data.data);
    },

    // Cập nhật bàn
    update: async (id: string, data: UpdateTableRequest): Promise<Table> => {
        const payload: any = { ...data };
        if (data.floor !== undefined) {
            payload.location = `Tầng ${data.floor}`;
        }
        const response = await apiClient.put<{ success: boolean; data: any }>(`/tables/${id}`, payload);
        return mapTable(response.data.data);
    },

    // Xóa bàn
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tables/${id}`);
    },
};

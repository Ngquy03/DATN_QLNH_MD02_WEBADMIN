import apiClient from './axios';

export interface ActivityLog {
    _id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    timestamp: string;
}

export interface ActivityLogFilters {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
}

export const activityService = {
    // Lấy tất cả activity logs
    getAll: async (filters?: ActivityLogFilters): Promise<{ data: ActivityLog[]; count: number }> => {
        const response = await apiClient.get<{ success: boolean; data: ActivityLog[]; count: number }>('/activity-logs', {
            params: filters,
        });
        return { data: response.data.data, count: response.data.count || 0 };
    },

    // Lấy activity logs của một user
    getByUser: async (userId: string, filters?: Omit<ActivityLogFilters, 'userId'>): Promise<{ data: ActivityLog[]; count: number }> => {
        const response = await apiClient.get<{ success: boolean; data: ActivityLog[]; count: number }>(`/activity-logs/user/${userId}`, {
            params: filters,
        });
        return { data: response.data.data, count: response.data.count || 0 };
    },

    // Tạo activity log mới (thường được gọi tự động từ backend)
    create: async (data: Partial<ActivityLog>): Promise<ActivityLog> => {
        const response = await apiClient.post<{ success: boolean; data: ActivityLog }>('/activity-logs', data);
        return response.data.data;
    },
};

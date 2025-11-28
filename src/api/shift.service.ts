import apiClient from './axios';

export interface ShiftEmployee {
    employeeId: string | {
        _id: string;
        name: string;
        username: string;
        role: string;
        phoneNumber?: string;
        email?: string;
    };
    checkinTime?: string;
    checkoutTime?: string;
    actualHours?: number;
    status: 'scheduled' | 'present' | 'late' | 'absent';
    note?: string;
}

export interface Shift {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    date: string;
    employees: ShiftEmployee[];
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateShiftRequest {
    name: string;
    startTime: string;
    endTime: string;
    date: string;
    employees?: {
        employeeId: string;
        status?: 'scheduled';
    }[];
    notes?: string;
}

export interface UpdateShiftRequest {
    name?: string;
    startTime?: string;
    endTime?: string;
    date?: string;
    employees?: ShiftEmployee[];
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
}

export interface CheckInRequest {
    employeeId: string;
}

export interface CheckOutRequest {
    employeeId: string;
}

export interface EmployeeShiftHistory {
    _id: string;
    name: string;
    date: string;
    employeeData: ShiftEmployee;
}

export const shiftService = {
    // Lấy tất cả ca làm việc
    getAll: async (params?: { date?: string; employeeId?: string }): Promise<{ data: Shift[]; count: number }> => {
        const response = await apiClient.get<{ success: boolean; data: Shift[]; count: number }>('/shifts', { params });
        return { data: response.data.data, count: response.data.count || 0 };
    },

    // Lấy ca làm việc theo ID
    getById: async (id: string): Promise<Shift> => {
        const response = await apiClient.get<{ success: boolean; data: Shift }>(`/shifts/${id}`);
        return response.data.data;
    },

    // Lấy lịch sử ca làm việc của nhân viên
    getEmployeeHistory: async (
        employeeId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<{ data: EmployeeShiftHistory[]; count: number; totalHours: number }> => {
        const response = await apiClient.get<{
            success: boolean;
            data: EmployeeShiftHistory[];
            count: number;
            totalHours: number;
        }>(`/shifts/employee/${employeeId}`, { params });
        return {
            data: response.data.data,
            count: response.data.count || 0,
            totalHours: response.data.totalHours || 0,
        };
    },

    // Tạo ca làm việc mới
    create: async (data: CreateShiftRequest): Promise<Shift> => {
        const response = await apiClient.post<{ success: boolean; data: Shift }>('/shifts', data);
        return response.data.data;
    },

    // Check-in
    checkIn: async (shiftId: string, data: CheckInRequest): Promise<Shift> => {
        const response = await apiClient.post<{ success: boolean; data: Shift }>(`/shifts/${shiftId}/checkin`, data);
        return response.data.data;
    },

    // Check-out
    checkOut: async (shiftId: string, data: CheckOutRequest): Promise<Shift> => {
        const response = await apiClient.post<{ success: boolean; data: Shift }>(`/shifts/${shiftId}/checkout`, data);
        return response.data.data;
    },

    // Cập nhật ca làm việc
    update: async (id: string, data: UpdateShiftRequest): Promise<Shift> => {
        const response = await apiClient.put<{ success: boolean; data: Shift }>(`/shifts/${id}`, data);
        return response.data.data;
    },

    // Xóa ca làm việc
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/shifts/${id}`);
    },
};

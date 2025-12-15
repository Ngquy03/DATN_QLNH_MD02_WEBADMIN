import apiClient from './axios';

export interface SalaryConfig {
    _id?: string;
    userId: string;
    baseSalary?: number;
    hourlyRate?: number;
    dailyRate?: number;
    allowance?: number;
    deductions?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface SalaryCalculation {
    userId: string;
    employeeName: string;
    username: string;
    role: string;
    month: number;
    year: number;
    totalHours: number;
    totalDays: number;
    hourlyRate: number;
    dailyRate: number;
    baseSalary: number;
    hourlyPay: number;
    dailyPay: number;
    monthlyPay: number;
    allowance: number;
    deductions: number;
    totalSalary: number;
    shiftsCount: number;
    status?: string;
    isPaid?: boolean;
    salaryLogId?: string;
}

export interface CalculateSalaryRequest {
    employeeId: string;
    startDate: string;
    endDate: string;
}

export interface FinalizeSalaryRequest {
    employeeId: string;
    month: number;
    year: number;
    bonus?: number;
    deductions?: number;
    note?: string;
}

export interface SalaryLog {
    _id: string;
    userId: string;
    month: number;
    year: number;
    totalHours: number;
    totalDays: number;
    baseSalary: number;
    totalSalary: number;
    bonus: number;
    deductions: number;
    note: string;
    status: 'pending' | 'paid';
    createdAt: string;
    updatedAt: string;
}

export const salaryService = {
    // Lấy cấu hình lương của nhân viên
    getEmployeeConfig: async (employeeId: string): Promise<SalaryConfig> => {
        const response = await apiClient.get<{ success: boolean; data: SalaryConfig }>(`/salary/config/${employeeId}`);
        return response.data.data;
    },

    // Cập nhật cấu hình lương
    updateConfig: async (employeeId: string, data: Partial<SalaryConfig>): Promise<SalaryConfig> => {
        const response = await apiClient.put<{ success: boolean; data: SalaryConfig }>(`/salary/config/${employeeId}`, data);
        return response.data.data;
    },

    // Tính lương cho nhân viên
    calculate: async (data: CalculateSalaryRequest): Promise<SalaryCalculation> => {
        const response = await apiClient.post<{ success: boolean; data: SalaryCalculation }>('/salary/calculate', data);
        return response.data.data;
    },

    // Lấy báo cáo lương theo tháng
    getMonthlyReport: async (month: number, year: number): Promise<SalaryCalculation[]> => {
        const response = await apiClient.get<{ success: boolean; data: SalaryCalculation[] }>('/salary/monthly-report', {
            params: { month, year },
        });
        return response.data.data;
    },

    // Chốt lương
    finalizeSalary: async (data: FinalizeSalaryRequest): Promise<SalaryLog> => {
        const response = await apiClient.post<{ success: boolean; data: SalaryLog }>('/salary/finalize', data);
        return response.data.data;
    },

    // Đánh dấu đã thanh toán
    markAsPaid: async (salaryLogId: string): Promise<SalaryLog> => {
        const response = await apiClient.put<{ success: boolean; data: SalaryLog }>(`/salary/mark-paid/${salaryLogId}`);
        return response.data.data;
    },

    // Lấy lịch sử lương của nhân viên
    getSalaryHistory: async (userId: string, limit: number = 12): Promise<SalaryLog[]> => {
        const response = await apiClient.get<{ success: boolean; data: SalaryLog[] }>(`/salary/history/${userId}`, {
            params: { limit },
        });
        return response.data.data;
    },
};

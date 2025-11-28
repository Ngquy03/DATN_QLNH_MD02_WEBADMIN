import apiClient from './axios';

export interface SalaryConfig {
    _id?: string;
    employeeId: string;
    hourlyRate?: number;
    dailyRate?: number;
    monthlyRate?: number;
    effectiveFrom: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SalaryCalculation {
    employeeId: string;
    employeeName: string;
    period: {
        startDate: string;
        endDate: string;
    };
    totalHours: number;
    totalDays: number;
    hourlyPay: number;
    dailyPay: number;
    monthlyPay: number;
    totalSalary: number;
    shifts: any[];
}

export interface CalculateSalaryRequest {
    employeeId: string;
    startDate: string;
    endDate: string;
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
        const response = await apiClient.get<{ success: boolean; data: any[] }>('/salary/monthly-report', {
            params: { month, year },
        });

        // Map backend response to SalaryCalculation interface
        return response.data.data.map((item: any) => ({
            employeeId: item.userId,
            employeeName: item.fullName || item.userName,
            period: {
                startDate: `${year}-${month}-01`,
                endDate: `${year}-${month}-28`, // Approximate
            },
            totalHours: item.totalHours || 0,
            totalDays: 0, // Backend not returning this yet
            hourlyPay: 0, // Backend returns hourlyWage but maybe not here
            dailyPay: 0,
            monthlyPay: 0,
            totalSalary: item.totalSalary || 0,
            shifts: [],
        }));
    },
};

import apiClient from './axios';
import { ApiResponse, Report } from './types';

export interface CreateDailyReportRequest {
    reportDate: string;
}

export interface CreateWeeklyReportRequest {
    startDate: string;
    endDate: string;
}

export const reportService = {
    // Lấy danh sách reports
    getAll: async (): Promise<Report[]> => {
        const response = await apiClient.get<ApiResponse<Report[]>>('/reports');
        return response.data.data;
    },

    // Tạo báo cáo ngày
    createDaily: async (data: CreateDailyReportRequest): Promise<Report> => {
        const response = await apiClient.post<ApiResponse<Report>>('/reports/daily', data);
        return response.data.data;
    },

    // Tạo báo cáo tuần
    createWeekly: async (data: CreateWeeklyReportRequest): Promise<Report> => {
        const response = await apiClient.post<ApiResponse<Report>>('/reports/weekly', data);
        return response.data.data;
    },

    // Xóa report
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/reports/${id}`);
    },
};

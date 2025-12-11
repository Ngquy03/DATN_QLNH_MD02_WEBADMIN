import apiClient from './axios';
import { ApiResponse, Report } from './types';

export interface CreateDailyReportRequest {
    reportDate: string;
}

export interface CreateWeeklyReportRequest {
    startDate: string;
    endDate: string;
}

export interface CreateMonthlyReportRequest {
    month: number;
    year: number;
}

export interface HourlyStatistic {
    hour: number;
    revenue: number;
    orders: number;
    discount: number;
}

export interface PeakHourData {
    hour: number;
    revenue: number;
    orders: number;
}

export interface PeakHoursResponse {
    peakHours: PeakHourData[];
    lowHours: PeakHourData[];
    allHours: PeakHourData[];
}

export interface DateRangeSummary {
    totalRevenue: number;
    totalOrders: number;
    totalDiscountGiven: number;
    averageOrderValue: number;
}

export interface DailyBreakdown {
    date: string;
    revenue: number;
    orders: number;
    discount: number;
}

export interface DateRangeReportResponse {
    summary: DateRangeSummary;
    dailyBreakdown: DailyBreakdown[];
}

export interface DetailedReportSummary {
    totalRevenue: number;
    totalOrders: number;
    totalDiscountGiven: number;
    averageOrderValue: number;
    period: number;
    averageRevenuePerDay: number;
    averageOrdersPerDay: number;
}

export interface DishStatistic {
    name: string;
    quantity: number;
    revenue: number;
}

export interface PaymentMethodStatistic {
    method: string;
    count: number;
    revenue: number;
}

export interface DetailedReportCharts {
    dailyRevenue: DailyBreakdown[];
    hourlyRevenue: PeakHourData[];
    topDishes: DishStatistic[];
    paymentMethods: PaymentMethodStatistic[];
}

export interface DetailedReportResponse {
    summary: DetailedReportSummary;
    charts: DetailedReportCharts;
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

    // Tạo báo cáo tháng
    createMonthly: async (data: CreateMonthlyReportRequest): Promise<Report> => {
        const response = await apiClient.post<ApiResponse<Report>>('/reports/monthly', data);
        return response.data.data;
    },

    // Thống kê theo giờ
    getHourlyStats: async (date: string): Promise<{ data: HourlyStatistic[]; date: string }> => {
        const response = await apiClient.get<{ success: boolean; data: HourlyStatistic[]; date: string }>(
            '/reports/hourly',
            { params: { date } }
        );
        return { data: response.data.data, date: response.data.date };
    },

    // Lấy giờ cao điểm
    getPeakHours: async (startDate: string, endDate: string): Promise<PeakHoursResponse> => {
        const response = await apiClient.get<{ success: boolean; data: PeakHoursResponse }>(
            '/reports/peak-hours',
            { params: { startDate, endDate } }
        );
        return response.data.data;
    },

    // Thống kê theo khoảng thời gian
    getDateRangeReport: async (startDate: string, endDate: string): Promise<DateRangeReportResponse> => {
        const response = await apiClient.get<{ success: boolean; data: DateRangeReportResponse }>(
            '/reports/date-range',
            { params: { startDate, endDate } }
        );
        return response.data.data;
    },

    // Lấy báo cáo chi tiết với biểu đồ
    getDetailedReport: async (startDate: string, endDate: string): Promise<DetailedReportResponse> => {
        const response = await apiClient.get<{ success: boolean; data: DetailedReportResponse }>(
            '/reports/detailed',
            { params: { startDate, endDate } }
        );
        return response.data.data;
    },

    // Xóa report
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/reports/${id}`);
    },
};


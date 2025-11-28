// API Response wrapper interface
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    count?: number;
    message?: string;
}

// API Error response interface
export interface ApiError {
    success: false;
    message: string;
    error?: any;
}

// Report interface
export interface Report {
    _id: string;
    reportType: 'daily_report' | 'weekly_report';
    totalRevenue: number;
    totalOrders: number;
    generatedAt: string;
    startDate?: string;
    endDate?: string;
}

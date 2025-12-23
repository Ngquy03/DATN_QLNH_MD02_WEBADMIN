import axiosInstance from './axios';

export interface ServiceDashboard {
    servingTables: number;
    waitingPayment: number;
    servingInvoices: number;
    paidToday: number;
    cookingDishes: number;
    overdueDishes: number;
}

export interface ServingTable {
    _id: string;
    tableNumber: number;
    capacity: number;
    status: string;
    currentOrder?: any;
}

export interface WaitingPaymentOrder {
    _id: string;
    tableNumber: any;
    finalAmount: number;
    orderStatus: string;
    createdAt: string;
}

export interface Invoice {
    _id: string;
    tableNumber: any;
    server: any;
    cashier: any;
    finalAmount: number;
    orderStatus: string;
    paymentMethod?: string;
    createdAt: string;
    paidAt?: string;
}

export interface CookingDish {
    orderId: string;
    tableNumber: number;
    menuItem: any;
    quantity: number;
    status: string;
    createdAt: string;
    server: any;
}

export interface OverdueDish extends CookingDish {
    minutesOverdue: number;
}

export const serviceService = {
    // Waiter
    getServingTables: async (): Promise<ServingTable[]> => {
        const response = await axiosInstance.get('/service/waiter/serving-tables');
        return response.data.data;
    },

    getWaitingPayment: async (): Promise<WaitingPaymentOrder[]> => {
        const response = await axiosInstance.get('/service/waiter/waiting-payment');
        return response.data.data;
    },

    // Cashier
    getServingInvoices: async (): Promise<Invoice[]> => {
        const response = await axiosInstance.get('/service/cashier/serving-invoices');
        return response.data.data;
    },

    getPaidInvoices: async (startDate?: string, endDate?: string): Promise<{ data: Invoice[], summary: any }> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await axiosInstance.get(`/service/cashier/paid-invoices?${params}`);
        return {
            data: response.data.data,
            summary: response.data.summary
        };
    },

    // Kitchen
    getCookingDishes: async (): Promise<CookingDish[]> => {
        const response = await axiosInstance.get('/service/kitchen/cooking-dishes');
        return response.data.data;
    },

    getOverdueDishes: async (): Promise<OverdueDish[]> => {
        const response = await axiosInstance.get('/service/kitchen/overdue-dishes');
        return response.data.data;
    },

    // Dashboard
    getDashboard: async (): Promise<ServiceDashboard> => {
        const response = await axiosInstance.get('/service/dashboard');
        return response.data.data;
    },
};

export default serviceService;

import axiosInstance from './axios';

// Interface cho Restaurant Settings
export interface RestaurantSettings {
    _id?: string;
    restaurantName: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingTime: string;
    closingTime: string;
    description?: string;
    logo?: string;
    taxRate?: number;
    serviceCharge?: number;
    currency?: string;
    timezone?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Interface cho Change Password Request
export interface ChangePasswordRequest {
    userId: string;
    oldPassword: string;
    newPassword: string;
}

// Interface cho Admin Reset Password Request
export interface AdminResetPasswordRequest {
    userId: string;
    newPassword: string;
}

// Lấy thông tin cài đặt nhà hàng
export const getRestaurantSettings = async (): Promise<RestaurantSettings> => {
    const response = await axiosInstance.get('/restaurant-settings');
    return response.data.data;
};

// Cập nhật thông tin cài đặt nhà hàng
export const updateRestaurantSettings = async (
    settings: Partial<RestaurantSettings>
): Promise<RestaurantSettings> => {
    const response = await axiosInstance.put('/restaurant-settings', settings);
    return response.data.data;
};

// Đổi mật khẩu (yêu cầu mật khẩu cũ)
export const changePassword = async (
    data: ChangePasswordRequest
): Promise<void> => {
    await axiosInstance.post('/restaurant-settings/change-password', data);
};

// Admin reset mật khẩu (không cần mật khẩu cũ)
export const adminResetPassword = async (
    data: AdminResetPasswordRequest
): Promise<void> => {
    await axiosInstance.post('/restaurant-settings/admin-reset-password', data);
};

const restaurantSettingsService = {
    getRestaurantSettings,
    updateRestaurantSettings,
    changePassword,
    adminResetPassword,
};

export default restaurantSettingsService;

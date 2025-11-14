
import React, { useState } from 'react';
import { User, NewUser, UpdateUser } from '../types';

const API_BASE_URL = 'http://localhost:3000';

interface UserFormModalProps {
    user: Partial<User> | null;
    token: string;
    onClose: () => void;
    onSave: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ user, token, onClose, onSave }) => {
    const isEditMode = !!user?._id;
    const [formData, setFormData] = useState({
        username: user?.username || '',
        password: '',
        role: user?.role || 'staff',
        name: user?.name || '',
        phoneNumber: user?.phoneNumber || '',
        email: user?.email || '',
        isActive: user?.isActive === false ? false : true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (error) setError(null); // Clear error on new input
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = (): string | null => {
        const { name, email, username, password, phoneNumber } = formData;
        if (!name.trim()) return 'Họ và Tên không được để trống.';
        if (!phoneNumber.trim()) return 'Số điện thoại không được để trống.';
        
        if (!isEditMode) { // Validation for create mode
            if (!username.trim()) return 'Tên đăng nhập không được để trống.';
            if (!email.trim()) return 'Email không được để trống.';
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return 'Địa chỉ email không hợp lệ.';
            }
            if (!password) {
                 return 'Mật khẩu không được để trống.';
            }
            if (password.length < 6) {
                return 'Mật khẩu phải có ít nhất 6 ký tự.';
            }
        }
        return null; // No errors
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            let response;
            if (isEditMode) {
                const updateData: UpdateUser = {
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    isActive: formData.isActive,
                    role: formData.role as User['role'],
                    email: formData.email,
                    username: formData.username,
                };
                response = await fetch(`${API_BASE_URL}/users/${user._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                });
            } else {
                const createData: NewUser = {
                    username: formData.username,
                    password: formData.password,
                    role: formData.role as User['role'],
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    email: formData.email,
                };
                 response = await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(createData),
                });
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Lưu người dùng thất bại.');
            }
            onSave();
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <style>{`
                    @keyframes fade-in-scale {
                        0% { transform: scale(0.95); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
                `}</style>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{isEditMode ? 'Chỉnh sửa Người dùng' : 'Tạo Người dùng mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">{error}</div>}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Họ và Tên" required className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required={!isEditMode} className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Tên đăng nhập" required={!isEditMode} className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        {!isEditMode && <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mật khẩu" required className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Số điện thoại" required className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                         <select name="role" value={formData.role} onChange={handleChange} required  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="customer">Khách hàng</option>
                         </select>
                    </div>
                    {isEditMode && (
                        <div className="flex items-center">
                            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Kích hoạt</label>
                        </div>
                    )}
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Hủy</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{isLoading ? 'Đang lưu...' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

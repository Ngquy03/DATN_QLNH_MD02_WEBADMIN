import React, { useState, useEffect } from 'react';
import { Ingredient } from '../types';

interface IngredientFormModalProps {
    ingredient: Ingredient | null;
    token: string;
    onClose: () => void;
    onSave: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

export const IngredientFormModal: React.FC<IngredientFormModalProps> = ({ ingredient, token, onClose, onSave }) => {
    const isEditMode = !!ingredient?._id;
    const [formData, setFormData] = useState({
        name: ingredient?.name || '',
        unit: ingredient?.unit || '',
        quantity: ingredient?.quantity || 0,
        minThreshold: ingredient?.minThreshold || 5,
        importPrice: ingredient?.importPrice || 0,
        supplier: ingredient?.supplier || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'minThreshold' || name === 'importPrice' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = isEditMode 
                ? `${API_BASE_URL}/ingredients/${ingredient._id}` 
                : `${API_BASE_URL}/ingredients`;
            
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Lưu nguyên liệu thất bại.');
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                    {isEditMode ? 'Sửa Nguyên liệu' : 'Nhập Nguyên liệu mới'}
                </h2>
                {error && <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded dark:bg-red-900 dark:text-red-200">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên nguyên liệu</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Đơn vị tính</label>
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} required placeholder="kg, lít, quả..." className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng tồn</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngưỡng báo động</label>
                            <input type="number" name="minThreshold" value={formData.minThreshold} onChange={handleChange} required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giá nhập (VNĐ)</label>
                            <input type="number" name="importPrice" value={formData.importPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nhà cung cấp</label>
                            <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-white">Hủy</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-indigo-400">{isLoading ? 'Đang lưu...' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
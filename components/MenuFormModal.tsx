import React, { useState } from 'react';
import { MenuItem } from '../types';

interface MenuFormModalProps {
    menuItem: MenuItem | null;
    token: string;
    onClose: () => void;
    onSave: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

export const MenuFormModal: React.FC<MenuFormModalProps> = ({ menuItem, token, onClose, onSave }) => {
    const isEditMode = !!menuItem?._id;
    
    // Chỉ init state dựa trên các trường có trong object JSON bạn đưa
    const [formData, setFormData] = useState({
        name: menuItem?.name || '',
        price: menuItem?.price || 0,
        category: menuItem?.category || 'Món chính',
        image: menuItem?.image || '',
        status: menuItem?.status || 'available' // Giữ nguyên giá trị cũ hoặc mặc định, không hiển thị UI chỉnh sửa nếu không cần
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = isEditMode ? `${API_BASE_URL}/menu/${menuItem._id}` : `${API_BASE_URL}/menu`;
            const method = isEditMode ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                alert('Lỗi khi lưu');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {isEditMode ? 'Sửa món ăn' : 'Thêm món mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                </div>

                {/* Form Body */}
                <form id="menuForm" onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Tên món */}
                    <div>
                        <label className={labelClass}>Tên món</label>
                        <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="VD: Cơm tấm sườn" 
                            required 
                            className={inputClass} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Giá */}
                        <div>
                            <label className={labelClass}>Giá (VNĐ)</label>
                            <input 
                                name="price" 
                                type="number" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required 
                                className={inputClass} 
                            />
                        </div>

                        {/* Danh mục */}
                        <div>
                            <label className={labelClass}>Danh mục</label>
                            <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                                <option value="Món chính">Món chính</option>
                                <option value="Khai vị">Khai vị</option>
                                <option value="Đồ uống">Đồ uống</option>
                                <option value="Tráng miệng">Tráng miệng</option>
                            </select>
                        </div>
                    </div>

                    {/* Hình ảnh */}
                    <div>
                        <label className={labelClass}>URL Hình ảnh</label>
                        <input 
                            name="image" 
                            value={formData.image} 
                            onChange={handleChange} 
                            placeholder="http://..." 
                            className={inputClass} 
                        />
                        {/* Preview ảnh nhỏ nếu có link */}
                        {formData.image && (
                            <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        form="menuForm" 
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition-all"
                    >
                        {isLoading ? 'Đang lưu...' : 'Lưu món ăn'}
                    </button>
                </div>
            </div>
        </div>
    );
};
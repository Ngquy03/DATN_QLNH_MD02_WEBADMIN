import React, { useState, useEffect } from 'react';
import { MenuItem, Ingredient } from '../types';
import { DeleteIcon, AddIcon } from './Icons';

interface MenuFormModalProps {
    menuItem: MenuItem | null;
    token: string;
    onClose: () => void;
    onSave: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

export const MenuFormModal: React.FC<MenuFormModalProps> = ({ menuItem, token, onClose, onSave }) => {
    const isEditMode = !!menuItem?._id;
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    
    // State form
    const [formData, setFormData] = useState({
        name: menuItem?.name || '',
        price: menuItem?.price || 0,
        category: menuItem?.category || 'Món chính',
        image: menuItem?.image || '',
        description: menuItem?.description || '',
        isAvailable: menuItem?.isAvailable ?? true,
        recipe: menuItem?.recipe.map(r => ({
            ingredientId: typeof r.ingredient === 'object' ? r.ingredient._id : r.ingredient,
            quantityNeeded: r.quantityNeeded
        })) || []
    });

    const [isLoading, setIsLoading] = useState(false);

    // Fetch danh sách nguyên liệu để chọn trong Recipe
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/ingredients`, { headers: {'Authorization': `Bearer ${token}`} });
                const data = await res.json();
                if (data.success) setIngredientsList(data.data);
            } catch (e) { console.error("Failed to load ingredients"); }
        };
        fetchIngredients();
    }, [token]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
        }
    };

    // Xử lý Recipe (Thêm/Sửa/Xóa dòng nguyên liệu)
    const addRecipeItem = () => {
        if (ingredientsList.length === 0) return;
        setFormData(prev => ({
            ...prev,
            recipe: [...prev.recipe, { ingredientId: ingredientsList[0]._id, quantityNeeded: 1 }]
        }));
    };

    const removeRecipeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recipe: prev.recipe.filter((_, i) => i !== index)
        }));
    };

    const updateRecipeItem = (index: number, field: 'ingredientId' | 'quantityNeeded', value: any) => {
        const newRecipe = [...formData.recipe];
        newRecipe[index] = { ...newRecipe[index], [field]: value };
        setFormData(prev => ({ ...prev, recipe: newRecipe }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Format lại recipe cho đúng chuẩn backend (ingredient: ObjectId)
        const payload = {
            ...formData,
            recipe: formData.recipe.map(r => ({
                ingredient: r.ingredientId,
                quantityNeeded: Number(r.quantityNeeded)
            }))
        };

        try {
            const url = isEditMode ? `${API_BASE_URL}/menu/${menuItem._id}` : `${API_BASE_URL}/menu`;
            const method = isEditMode ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                alert('Lỗi khi lưu món ăn');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="w-full max-w-2xl p-6 my-8 bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{isEditMode ? 'Sửa Món Ăn' : 'Thêm Món Mới'}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Thông tin chung */}
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleInfoChange} placeholder="Tên món" required className="col-span-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
                        <input name="price" type="number" value={formData.price} onChange={handleInfoChange} placeholder="Giá bán" required className="col-span-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <select name="category" value={formData.category} onChange={handleInfoChange} className="col-span-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                            <option value="Món chính">Món chính</option>
                            <option value="Khai vị">Khai vị</option>
                            <option value="Đồ uống">Đồ uống</option>
                            <option value="Tráng miệng">Tráng miệng</option>
                        </select>
                         <input name="image" value={formData.image} onChange={handleInfoChange} placeholder="URL hình ảnh" className="col-span-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
                    </div>

                    <textarea name="description" value={formData.description} onChange={handleInfoChange} placeholder="Mô tả món ăn" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />

                    {/* Checkbox Trạng thái */}
                    <div className="flex items-center">
                        <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleInfoChange} className="w-4 h-4 text-indigo-600" />
                        <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-900 dark:text-gray-300">Đang kinh doanh</label>
                    </div>

                    {/* Phần CÔNG THỨC (Recipe) */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold dark:text-white">Công thức (Định lượng)</h3>
                            <button type="button" onClick={addRecipeItem} className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center">
                                <AddIcon className="w-4 h-4 mr-1"/> Thêm nguyên liệu
                            </button>
                        </div>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {formData.recipe.map((r, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select 
                                        value={r.ingredientId} 
                                        onChange={(e) => updateRecipeItem(index, 'ingredientId', e.target.value)}
                                        className="flex-1 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:text-white"
                                    >
                                        {ingredientsList.map(ing => (
                                            <option key={ing._id} value={ing._id}>{ing.name} ({ing.unit})</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="number" 
                                        value={r.quantityNeeded} 
                                        onChange={(e) => updateRecipeItem(index, 'quantityNeeded', e.target.value)}
                                        placeholder="Số lượng"
                                        step="0.01"
                                        className="w-24 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                    <button type="button" onClick={() => removeRecipeItem(index)} className="text-red-500 hover:text-red-700">
                                        <DeleteIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                            {formData.recipe.length === 0 && <p className="text-sm text-gray-500 italic">Chưa có công thức cho món này.</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-white">Hủy</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700">{isLoading ? 'Lưu' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
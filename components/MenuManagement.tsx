import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';
import { EditIcon, DeleteIcon, AddIcon } from './Icons';
import { MenuFormModal } from './MenuFormModal';

const API_BASE_URL = 'http://localhost:3000';

interface Props {
  token: string;
}

const MenuManagement: React.FC<Props> = ({ token }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      // Giả sử API trả về data chuẩn theo object bạn đưa
      if (result) setMenuItems(result.data || result); 
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa món này?')) return;
    try {
        await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchMenu();
    } catch (err) { alert('Lỗi khi xóa'); }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Thực Đơn</h2>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }} 
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md"
          >
              <AddIcon className="mr-2 w-5 h-5"/> Thêm món
          </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
              <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                  {/* Ảnh món ăn */}
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                      {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                      )}
                      {/* Badge danh mục */}
                      <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                          {item.category}
                      </span>
                  </div>

                  {/* Thông tin */}
                  <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate" title={item.name}>{item.name}</h3>
                      <p className="text-xl font-bold text-indigo-600 mb-4">{formatCurrency(item.price)}</p>
                      
                      <div className="mt-auto flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <button 
                             onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                             className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                          >
                             Sửa
                          </button>
                          <button 
                             onClick={() => handleDelete(item._id)} 
                             className="px-3 py-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                             <DeleteIcon className="w-5 h-5"/>
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
      
      {isModalOpen && <MenuFormModal menuItem={editingItem} token={token} onClose={() => setIsModalOpen(false)} onSave={fetchMenu}/>}
    </div>
  );
};

export default MenuManagement;
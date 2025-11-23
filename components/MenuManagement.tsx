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
      if (result.success) setMenuItems(result.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa món ăn này?')) return;
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
    <>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Quản lý Thực Đơn</h2>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <AddIcon className="mr-2"/> Thêm món
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow dark:bg-gray-800 overflow-hidden border dark:border-gray-700 flex flex-col">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                      {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${item.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {item.isAvailable ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>
                      <p className="text-indigo-600 font-bold text-lg mb-4">{formatCurrency(item.price)}</p>
                      
                      <div className="mt-auto flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><EditIcon/></button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><DeleteIcon/></button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
      
      {isModalOpen && <MenuFormModal menuItem={editingItem} token={token} onClose={() => setIsModalOpen(false)} onSave={fetchMenu}/>}
    </>
  );
};

export default MenuManagement;
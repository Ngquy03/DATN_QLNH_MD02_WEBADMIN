import React, { useState, useEffect, useCallback } from 'react';
import { Ingredient } from '../types';
import { EditIcon, DeleteIcon, AddIcon } from './Icons';
import { IngredientFormModal } from './IngredientFormModal';

const API_BASE_URL = 'http://localhost:3000';

interface Props {
  token: string;
}

const IngredientManagement: React.FC<Props> = ({ token }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const fetchIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setIngredients(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa nguyên liệu này?')) return;
    try {
        await fetch(`${API_BASE_URL}/ingredients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchIngredients();
    } catch (err) {
        alert('Lỗi khi xóa');
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'available': return 'bg-green-100 text-green-800';
          case 'low_stock': return 'bg-yellow-100 text-yellow-800';
          case 'out_of_stock': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusText = (status: string) => {
      switch(status) {
          case 'available': return 'Sẵn có';
          case 'low_stock': return 'Sắp hết';
          case 'out_of_stock': return 'Hết hàng';
          default: return status;
      }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold">Kho Nguyên Liệu</h2>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <AddIcon className="mr-2"/> Nhập kho
          </button>
      </div>

      {!isLoading && (
          <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th className="px-6 py-3">Tên</th>
                          <th className="px-6 py-3 text-center">Số lượng</th>
                          <th className="px-6 py-3">Đơn vị</th>
                          <th className="px-6 py-3">Trạng thái</th>
                          <th className="px-6 py-3 text-right">Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {ingredients.map((item) => (
                          <tr key={item._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                              <td className="px-6 py-4 text-center font-mono font-bold">{item.quantity}</td>
                              <td className="px-6 py-4">{item.unit}</td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                      {getStatusText(item.status)}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end space-x-3">
                                  <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900"><EditIcon /></button>
                                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
      {isModalOpen && <IngredientFormModal ingredient={editingItem} token={token} onClose={() => setIsModalOpen(false)} onSave={fetchIngredients}/>}
    </>
  );
};

export default IngredientManagement;
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { EditIcon, DeleteIcon, AddIcon } from './Icons';
import { UserFormModal } from './UserFormModal';

const API_BASE_URL = 'http://localhost:3000';

interface UserManagementProps {
  token: string;
  onLogout: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ token, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Tải danh sách người dùng thất bại' }));
        throw new Error(data.message || 'Tải danh sách người dùng thất bại');
      }
      const result = await response.json();
      
      // Updated Check: Ensure the response has a 'data' property that is an array
      if (result && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        console.error("API response is not in the expected format:", result);
        setUsers([]); // Set to empty array to prevent crash
        setError("Dữ liệu người dùng nhận được có định dạng không hợp lệ.");
      }

    } catch (err) {
      setUsers([]); // Reset users on error
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Xóa người dùng thất bại');
            }
            fetchUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
        }
    }
  };
  
  const handleSave = () => {
    fetchUsers();
  };

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-semibold">Danh sách Người dùng</h2>
          <button onClick={handleCreateUser} className="flex items-center self-end px-4 py-2 space-x-2 font-semibold text-white bg-indigo-600 rounded-md sm:self-auto hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <AddIcon />
              <span>Người dùng mới</span>
          </button>
      </div>

      {isLoading && <p className="text-center text-gray-500">Đang tải danh sách người dùng...</p>}
      {error && <p className="p-4 text-center text-red-500 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">Lỗi: {error}</p>}
      {!isLoading && !error && (
          <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th scope="col" className="px-6 py-3">Tên</th>
                          <th scope="col" className="hidden px-6 py-3 sm:table-cell">Email</th>
                          <th scope="col" className="hidden px-6 py-3 md:table-cell">Vai trò</th>
                          <th scope="col" className="px-6 py-3">Trạng thái</th>
                          <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</td>
                                <td className="hidden px-6 py-4 sm:table-cell">{user.email}</td>
                                <td className="hidden px-6 py-4 capitalize md:table-cell">{user.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                        {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </td>
                                <td className="flex items-center justify-end px-6 py-4 space-x-3">
                                    <button onClick={() => handleEditUser(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        ))
                      ) : (
                        <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">Không tìm thấy người dùng nào.</td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}
      {isModalOpen && <UserFormModal user={editingUser} token={token} onClose={() => setIsModalOpen(false)} onSave={handleSave}/>}
    </>
  );
};

export default UserManagement;
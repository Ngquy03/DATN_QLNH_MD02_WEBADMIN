
import React, { useState } from 'react';
import { LogoutIcon, UserIcon } from './Icons';
import UserManagement from './UserManagement';
import Settings from './Settings';
import Statistics from './Statistics';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

type Tab = 'users' | 'statistics' | 'settings';

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement token={token} onLogout={onLogout} />;
      case 'statistics':
        return <Statistics token={token} />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  const getTabClass = (tabName: Tab) => 
    `px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${
      activeTab === tabName 
      ? 'bg-indigo-600 text-white shadow' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800">
        <div className="flex items-center space-x-2">
            <UserIcon className="w-8 h-8 text-indigo-500"/>
            <h1 className="text-xl font-bold">Bảng điều khiển</h1>
        </div>
        <button onClick={onLogout} className="flex items-center px-4 py-2 space-x-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <LogoutIcon />
            <span>Đăng xuất</span>
        </button>
      </header>

      <main className="p-4 mx-auto max-w-7xl md:p-8">
        <nav className="flex p-1 mb-6 space-x-2 bg-gray-200 rounded-lg dark:bg-gray-700 w-full sm:w-auto overflow-x-auto">
          <button onClick={() => setActiveTab('users')} className={getTabClass('users')}>
            Quản lý Người dùng
          </button>
          <button onClick={() => setActiveTab('statistics')} className={getTabClass('statistics')}>
            Thống kê
          </button>
          <button onClick={() => setActiveTab('settings')} className={getTabClass('settings')}>
            Cài đặt
          </button>
        </nav>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

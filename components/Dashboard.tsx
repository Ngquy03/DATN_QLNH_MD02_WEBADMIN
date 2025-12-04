import React, { useState } from 'react';
import { LogoutIcon, UserIcon } from './Icons';
import UserManagement from './UserManagement';
import Settings from './Settings';
import Statistics from './Statistics';
// Import các component mới
import IngredientManagement from './IngredientManagement';
import MenuManagement from './MenuManagement';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

// Thêm types cho Tab
type Tab = 'users' | 'statistics' | 'settings' | 'menu' | 'ingredients';

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('statistics'); // Đổi mặc định nếu thích

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement token={token} onLogout={onLogout} />;
      case 'statistics':
        return <Statistics token={token} />;
      case 'settings':
        return <Settings />;
      case 'menu':
        return <MenuManagement token={token} />;
      case 'ingredients':
        return <IngredientManagement token={token} />;
      default:
        return null;
    }
  };

  const getTabClass = (tabName: Tab) =>
    `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md cursor-pointer transition-colors duration-200 ${activeTab === tabName
      ? 'bg-indigo-600 text-white shadow'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <UserIcon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-xl font-bold hidden sm:block">Nhà Hàng ABC</h1>
        </div>
        <button onClick={onLogout} className="flex items-center px-4 py-2 space-x-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none">
          <LogoutIcon />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </header>

      <main className="p-4 mx-auto max-w-7xl md:p-8">
        {/* Thanh điều hướng */}
        <nav className="flex p-1 mb-6 space-x-2 bg-gray-200 rounded-lg dark:bg-gray-700 w-full overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab('statistics')} className={getTabClass('statistics')}>Thống kê</button>
          <button onClick={() => setActiveTab('menu')} className={getTabClass('menu')}>Thực đơn</button>
          <button onClick={() => setActiveTab('ingredients')} className={getTabClass('ingredients')}>Kho hàng</button>
          <button onClick={() => setActiveTab('users')} className={getTabClass('users')}>Nhân viên</button>
          <button onClick={() => setActiveTab('settings')} className={getTabClass('settings')}>Cài đặt</button>
        </nav>

        <div className="mt-4 animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
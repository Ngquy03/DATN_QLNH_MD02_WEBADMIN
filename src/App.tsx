import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import MainLayout from './components/layout/MainLayout';
import Login from './components/modules/Login';
import Dashboard from './components/modules/Dashboard';
import UserManagement from './components/modules/UserManagement';
import MenuManagement from './components/modules/MenuManagement';
import IngredientManagement from './components/modules/IngredientManagement';
import Settings from './components/modules/Settings';
import Statistics from './components/modules/Statistics';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentPage('dashboard');
    };

    const handlePageChange = (page: string) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'statistics':
                return <Statistics />;
            case 'menu':
                return <MenuManagement />;
            case 'ingredients':
                return <IngredientManagement />;
            case 'users':
                return <UserManagement />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Đang tải...</div>
            </div>
        );
    }

    return (
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 6,
                },
            }}
        >
            {isAuthenticated ? (
                <MainLayout
                    onLogout={handleLogout}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                >
                    {renderPage()}
                </MainLayout>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </ConfigProvider>
    );
};

export default App;

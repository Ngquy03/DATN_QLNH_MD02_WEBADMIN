import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    ShoppingOutlined,
    InboxOutlined,
    SettingOutlined,
    LogoutOutlined,
    BellOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
    onPageChange?: (page: string) => void;
    currentPage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout, onPageChange, currentPage = 'dashboard' }) => {
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Mapping giữa menu key và page name
    const pageKeyMap: Record<string, string> = {
        '1': 'dashboard',
        '2': 'statistics',
        '3': 'menu',
        '4': 'ingredients',
        '5': 'users',
        '6': 'settings',
    };

    // Reverse mapping để tìm key từ page name
    const keyPageMap: Record<string, string> = {
        'dashboard': '1',
        'statistics': '2',
        'menu': '3',
        'ingredients': '4',
        'users': '5',
        'settings': '6',
    };

    // Menu items cho sidebar
    const menuItems: MenuProps['items'] = [
        {
            key: '1',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: '2',
            icon: <FileTextOutlined />,
            label: 'Báo cáo',
        },
        {
            key: '3',
            icon: <ShoppingOutlined />,
            label: 'Thực đơn',
        },
        {
            key: '4',
            icon: <InboxOutlined />,
            label: 'Kho hàng',
        },
        {
            key: '5',
            icon: <UserOutlined />,
            label: 'Nhân viên',
        },
        {
            key: '6',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
    ];

    const handleMenuClick = (key: string) => {
        const pageName = pageKeyMap[key];
        if (pageName && onPageChange) {
            onPageChange(pageName);
        }
    };

    // Dropdown menu cho user avatar
    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: onLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div style={{
                    height: 64,
                    margin: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: collapsed ? 20 : 24,
                    fontWeight: 'bold',
                }}>
                    {collapsed ? '' : 'Quản lý Nhà Hàng'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[keyPageMap[currentPage] || '1']}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            size="large"
                            style={{ fontSize: 18 }}
                        />
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Avatar
                                size="large"
                                icon={<UserOutlined />}
                                style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                            />
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;

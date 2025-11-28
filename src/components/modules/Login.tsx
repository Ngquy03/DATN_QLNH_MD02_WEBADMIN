import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService, LoginRequest } from '../../api';
import Card from '../common/Card';

const { Title, Text } = Typography;

interface LoginProps {
    onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: LoginRequest) => {
        setLoading(true);
        try {
            const response = await authService.login(values);
            message.success('Đăng nhập thành công!');
            onLogin(response.token);
        } catch (error) {
            // Error đã được xử lý trong axios interceptor
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    borderRadius: 16,
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🍽️</div>
                    <Title level={2} style={{ margin: 0 }}>
                        Nhà Hàng Admin
                    </Title>
                    <Text type="secondary">Đăng nhập để quản lý hệ thống</Text>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={handleSubmit}
                    layout="vertical"
                    size="large"
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Tên đăng nhập"
                            autoComplete="username"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{ height: 48, fontSize: 16, fontWeight: 600 }}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        © 2024 Restaurant Management System
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default Login;

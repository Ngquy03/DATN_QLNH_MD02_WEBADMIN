import React from 'react';
import { Form, Input, Button, Switch, Typography, Divider, Space } from 'antd';
import { Card } from '../common';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Settings saved:', values);
    };

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                Cài đặt hệ thống (Đang phát triển)
            </Title>

            <Card title="Thông tin nhà hàng">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        restaurantName: 'Nhà Hàng ABC',
                        address: '123 Đường ABC, Quận 1, TP.HCM',
                        phone: '0123456789',
                        email: 'contact@restaurant.com',
                        notifications: true,
                        autoBackup: true,
                    }}
                >
                    <Form.Item
                        name="restaurantName"
                        label="Tên nhà hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <Input />
                    </Form.Item>



                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Divider />

                    <Title level={4}>Tùy chọn hệ thống</Title>

                    <Form.Item
                        name="notifications"
                        label="Thông báo"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="autoBackup"
                        label="Tự động sao lưu"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" size="large">
                                Lưu thay đổi
                            </Button>
                            <Button size="large">
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Settings;

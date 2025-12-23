import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    TimePicker,
    InputNumber,
    message,
    Tabs,
    Space,
    Typography,
    Divider,
    Row,
    Col,
} from 'antd';
import {
    ShopOutlined,
    ClockCircleOutlined,
    LockOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import restaurantSettingsService, {
    RestaurantSettings,
} from '../../api/restaurantSettings.service';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const RestaurantManagement: React.FC = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [settings, setSettings] = useState<RestaurantSettings | null>(null);

    // Lấy thông tin nhà hàng khi component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await restaurantSettingsService.getRestaurantSettings();
            setSettings(data);

            // Set form values
            form.setFieldsValue({
                restaurantName: data.restaurantName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                email: data.email,
                openingTime: data.openingTime ? dayjs(data.openingTime, 'HH:mm') : null,
                closingTime: data.closingTime ? dayjs(data.closingTime, 'HH:mm') : null,
                description: data.description,
                taxRate: data.taxRate,
                serviceCharge: data.serviceCharge,
            });
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải thông tin nhà hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (values: any) => {
        try {
            setLoading(true);

            const updateData: Partial<RestaurantSettings> = {
                restaurantName: values.restaurantName,
                address: values.address,
                phoneNumber: values.phoneNumber,
                email: values.email,
                openingTime: values.openingTime?.format('HH:mm'),
                closingTime: values.closingTime?.format('HH:mm'),
                description: values.description,
                taxRate: values.taxRate,
                serviceCharge: values.serviceCharge,
            };

            await restaurantSettingsService.updateRestaurantSettings(updateData);
            message.success('Cập nhật thông tin nhà hàng thành công');
            fetchSettings();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: any) => {
        try {
            setPasswordLoading(true);

            // Lấy userId từ localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                message.error('Không tìm thấy thông tin người dùng');
                return;
            }

            const user = JSON.parse(userStr);

            await restaurantSettingsService.changePassword({
                userId: user._id,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });

            message.success('Đổi mật khẩu thành công');
            passwordForm.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>
                <ShopOutlined /> Quản Lý Nhà Hàng
            </Title>

            <Tabs defaultActiveKey="1" size="large">
                {/* Tab Thông Tin Nhà Hàng */}
                <TabPane
                    tab={
                        <span>
                            <ShopOutlined />
                            Thông Tin Nhà Hàng
                        </span>
                    }
                    key="1"
                >
                    <Card loading={loading}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdateSettings}
                            autoComplete="off"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Tên Nhà Hàng"
                                        name="restaurantName"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên nhà hàng' },
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            placeholder="Nhập tên nhà hàng"
                                            prefix={<ShopOutlined />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Số Điện Thoại"
                                        name="phoneNumber"
                                        rules={[
                                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Địa Chỉ"
                                name="address"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập địa chỉ' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Nhập địa chỉ nhà hàng"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { type: 'email', message: 'Email không hợp lệ' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Nhập email"
                                />
                            </Form.Item>

                            <Divider>
                                <ClockCircleOutlined /> Giờ Hoạt Động
                            </Divider>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Giờ Mở Cửa"
                                        name="openingTime"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn giờ mở cửa' },
                                        ]}
                                    >
                                        <TimePicker
                                            size="large"
                                            format="HH:mm"
                                            placeholder="Chọn giờ mở cửa"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Giờ Đóng Cửa"
                                        name="closingTime"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn giờ đóng cửa' },
                                        ]}
                                    >
                                        <TimePicker
                                            size="large"
                                            format="HH:mm"
                                            placeholder="Chọn giờ đóng cửa"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider>Thông Tin Bổ Sung</Divider>

                            <Form.Item
                                label="Mô Tả"
                                name="description"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Nhập mô tả về nhà hàng"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Thuế VAT (%)"
                                        name="taxRate"
                                    >
                                        <InputNumber
                                            size="large"
                                            min={0}
                                            max={100}
                                            placeholder="Nhập % thuế"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Phí Phục Vụ (%)"
                                        name="serviceCharge"
                                    >
                                        <InputNumber
                                            size="large"
                                            min={0}
                                            max={100}
                                            placeholder="Nhập % phí phục vụ"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        size="large"
                                        loading={loading}
                                    >
                                        Lưu Thay Đổi
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={() => form.resetFields()}
                                    >
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>

                {/* Tab Đổi Mật Khẩu */}
                <TabPane
                    tab={
                        <span>
                            <LockOutlined />
                            Đổi Mật Khẩu
                        </span>
                    }
                    key="2"
                >
                    <Card>
                        <div style={{ maxWidth: 600, margin: '0 auto' }}>
                            <Title level={4}>Đổi Mật Khẩu</Title>
                            <Text type="secondary">
                                Vui lòng nhập mật khẩu cũ và mật khẩu mới để thay đổi
                            </Text>

                            <Divider />

                            <Form
                                form={passwordForm}
                                layout="vertical"
                                onFinish={handleChangePassword}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label="Mật Khẩu Cũ"
                                    name="oldPassword"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu cũ' },
                                    ]}
                                >
                                    <Input.Password
                                        size="large"
                                        placeholder="Nhập mật khẩu cũ"
                                        prefix={<LockOutlined />}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Mật Khẩu Mới"
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                    ]}
                                >
                                    <Input.Password
                                        size="large"
                                        placeholder="Nhập mật khẩu mới"
                                        prefix={<LockOutlined />}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Xác Nhận Mật Khẩu Mới"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        size="large"
                                        placeholder="Nhập lại mật khẩu mới"
                                        prefix={<LockOutlined />}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Space>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<LockOutlined />}
                                            size="large"
                                            loading={passwordLoading}
                                        >
                                            Đổi Mật Khẩu
                                        </Button>
                                        <Button
                                            size="large"
                                            onClick={() => passwordForm.resetFields()}
                                        >
                                            Hủy
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default RestaurantManagement;

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Input,
    Modal,
    Form,
    Select,
    message,
    Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { Card, PageLoader } from '../common';
import { userService, User, CreateUserRequest, UpdateUserRequest } from '../../api';

const { Title } = Typography;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle create/update user
    const handleSubmit = async (values: CreateUserRequest | UpdateUserRequest) => {
        try {
            if (editingUser) {
                await userService.update(editingUser.id, values as UpdateUserRequest);
                message.success('Cập nhật nhân viên thành công!');
            } else {
                await userService.create(values as CreateUserRequest);
                message.success('Thêm nhân viên thành công!');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    // Handle delete user
    const handleDelete = async (id: string) => {
        try {
            await userService.delete(id);
            message.success('Xóa nhân viên thành công!');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Open modal for create/edit
    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'ADMIN';
            case 'manager':
                return 'Quản lý';
            case 'staff':
                return 'Nhân viên';
            case 'kitchen':
                return 'Bếp';
            case 'order':
                return 'Phục vụ';
            default:
                return 'Unknown';
        }
    }
    // Table columns
    const columns: ColumnsType<User> = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                record.username.toLowerCase().includes(value.toString().toLowerCase()) ||
                (record.name?.toLowerCase().includes(value.toString().toLowerCase()) ?? false),
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const color = role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'green';
                return <Tag color={color}>{
                    getRoleLabel(role)
                }</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (status: string) => (
                <Tag color={status ? 'success' : 'default'}>
                    {status ? 'Hoạt động' : 'Ngưng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa nhân viên"
                        description="Bạn có chắc chắn muốn xóa nhân viên này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading && users.length === 0) {
        return <PageLoader />;
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Quản lý nhân viên
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                    size="large"
                >
                    Thêm nhân viên
                </Button>
            </div>

            <Card>
                <Input
                    placeholder="Tìm kiếm nhân viên..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    size="large"
                />

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nhân viên`,
                    }}
                />
            </Card>

            <Modal
                title={editingUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingUser(null);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                        ]}
                    >
                        <Input disabled={!!editingUser} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="name"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="phoneNumber" label="Số điện thoại">
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select
                            options={[
                                { value: 'admin', label: 'ADMIN' },
                                { value: 'manager', label: 'Quản lý' },
                                { value: 'staff', label: 'Nhân viên' },
                                { value: 'kitchen', label: 'Bếp' },
                                { value: 'order', label: 'Phục Vụ' },


                            ]}
                        />
                    </Form.Item>

                    {editingUser && (
                        <Form.Item name="isActive" label="Trạng thái">
                            <Select
                                options={[
                                    { value: true, label: 'Hoạt động' },
                                    { value: false, label: 'Ngưng' },
                                ]}
                            />
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;

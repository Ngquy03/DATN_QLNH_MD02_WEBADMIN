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
    InputNumber,
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
    ReloadOutlined
} from '@ant-design/icons';
import { Card, PageLoader } from '../common';
import { menuService, MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../../api';

const { Title } = Typography;
const { TextArea } = Input;

const MenuManagement: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const data = await menuService.getAll();
            // Đảm bảo data là array
            setMenuItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();

        // Auto-refresh mỗi 30 giây để cập nhật trạng thái món
        const interval = setInterval(() => {
            fetchMenuItems();
            console.log('🔄 Auto-refresh menu status');
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (values: CreateMenuItemRequest | UpdateMenuItemRequest) => {
        try {
            if (editingItem) {
                await menuService.update(editingItem.id, values as UpdateMenuItemRequest);
                message.success('Cập nhật món ăn thành công!');
            } else {
                await menuService.create(values as CreateMenuItemRequest);
                message.success('Thêm món ăn thành công!');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingItem(null);
            fetchMenuItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await menuService.delete(id);
            message.success('Xóa món ăn thành công!');
            fetchMenuItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    const openModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            form.setFieldsValue(item);
        } else {
            setEditingItem(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const columns: ColumnsType<MenuItem> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image: string) => (
                <img
                    src={image || 'https://via.placeholder.com/60'}
                    alt="Menu item"
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                />
            ),
        },
        {
            title: 'Tên món',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                record.name.toLowerCase().includes(value.toString().toLowerCase()),
        },

        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => (
                <span style={{ fontWeight: 600, color: '#f5222d' }}>
                    {price.toLocaleString('vi-VN')}₫
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'available' ? 'success' : 'default'}>
                    {status === 'available' ? 'Có sẵn' : 'Hết'}
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
                        title="Xóa món ăn"
                        description="Bạn có chắc chắn muốn xóa món ăn này?"
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

    if (loading && menuItems.length === 0) {
        return <PageLoader />;
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Quản lý thực đơn
                </Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchMenuItems} // hoặc reload function
                    loading={loading}
                    size="large"
                >
                    Tải lại
                </Button>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                    size="large"
                >
                    Thêm món ăn
                </Button>

            </div>

            <Card>
                <Input
                    placeholder="Tìm kiếm món ăn..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    size="large"
                />

                <Table
                    columns={columns}
                    dataSource={menuItems}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} món ăn`,
                    }}
                />
            </Card>

            <Modal
                title={editingItem ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingItem(null);
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
                        name="name"
                        label="Tên món"
                        rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}
                    >
                        <Input />
                    </Form.Item>



                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                    >
                        <Select
                            options={[
                                { value: 'Khai vị', label: 'Khai vị' },
                                { value: 'Món chính', label: 'Món chính' },
                                { value: 'Tráng miệng', label: 'Tráng miệng' },
                                { value: 'Đồ uống', label: 'Đồ uống' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Giá (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="URL hình ảnh"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    {/* {editingItem && (
                        <Form.Item name="status" label="Trạng thái">
                            <Select
                                options={[
                                    { value: 'available', label: 'Có sẵn' },
                                    { value: 'unavailable', label: 'Hết' },
                                ]}
                            />
                        </Form.Item>
                    )} */}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingItem ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuManagement;

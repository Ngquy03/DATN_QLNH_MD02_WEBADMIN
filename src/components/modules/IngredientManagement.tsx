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
    message,
    Popconfirm,
    Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { Card, PageLoader } from '../common';
import { ingredientService, Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../../api';

const { Title } = Typography;

const IngredientManagement: React.FC = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const data = await ingredientService.getAll();
            setIngredients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            setIngredients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const handleSubmit = async (values: CreateIngredientRequest | UpdateIngredientRequest) => {
        try {
            if (editingItem) {
                await ingredientService.update(editingItem.id, values as UpdateIngredientRequest);
                message.success('Cập nhật nguyên liệu thành công!');
            } else {
                await ingredientService.create(values as CreateIngredientRequest);
                message.success('Thêm nguyên liệu thành công!');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingItem(null);
            fetchIngredients();
        } catch (error) {
            console.error('Error saving ingredient:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await ingredientService.delete(id);
            message.success('Xóa nguyên liệu thành công!');
            fetchIngredients();
        } catch (error) {
            console.error('Error deleting ingredient:', error);
        }
    };

    const openModal = (item?: Ingredient) => {
        if (item) {
            setEditingItem(item);
            form.setFieldsValue(item);
        } else {
            setEditingItem(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const getStockStatus = (quantity: number, minThreshold: number = 0) => {
        const percentage = minThreshold > 0 ? (quantity / minThreshold) * 100 : 100;
        if (percentage <= 50) return { color: 'red', text: 'Sắp hết' };
        if (percentage <= 100) return { color: 'orange', text: 'Thấp' };
        return { color: 'green', text: 'Đủ' };
    };

    const columns: ColumnsType<Ingredient> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image: string) => (
                image ? (
                    <img
                        src={image}
                        alt="Ingredient"
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                ) : (
                    <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                )
            ),
        },
        {
            title: 'Tên nguyên liệu',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                record.name.toLowerCase().includes(value.toString().toLowerCase()),
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            key: 'tag',
            render: (tag: string) => tag ? <Tag color="purple">{tag}</Tag> : '-',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record) => {
                const status = getStockStatus(quantity, record.minThreshold);
                return (
                    <Space>
                        <span style={{ fontWeight: 600 }}>
                            {quantity} {record.unit}
                        </span>
                        {record.minThreshold && quantity <= record.minThreshold && (
                            <WarningOutlined style={{ color: status.color }} />
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Mức tối thiểu',
            dataIndex: 'minThreshold',
            key: 'minThreshold',
            render: (minThreshold: number, record) => (
                <span>{minThreshold ? `${minThreshold} ${record.unit}` : '-'}</span>
            ),
        },
        {
            title: 'Tình trạng',
            key: 'status',
            render: (_, record) => {
                const status = getStockStatus(record.quantity, record.minThreshold);
                const percentage = record.minThreshold
                    ? Math.min((record.quantity / record.minThreshold) * 100, 100)
                    : 100;

                return (
                    <div style={{ width: 120 }}>
                        <Progress
                            percent={Math.round(percentage)}
                            size="small"
                            status={percentage <= 50 ? 'exception' : percentage <= 100 ? 'normal' : 'success'}
                            showInfo={false}
                        />
                        <Tag color={status.color} style={{ marginTop: 4 }}>
                            {status.text}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: 'Giá nhập',
            dataIndex: 'importPrice',
            key: 'importPrice',
            render: (importPrice: number) => (
                importPrice ? `${importPrice.toLocaleString('vi-VN')}₫` : '-'
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
            render: (supplier: string) => supplier || '-',
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
                        title="Xóa nguyên liệu"
                        description="Bạn có chắc chắn muốn xóa nguyên liệu này?"
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

    if (loading && ingredients.length === 0) {
        return <PageLoader />;
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Quản lý kho hàng
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                    size="large"
                >
                    Thêm nguyên liệu
                </Button>
            </div>

            <Card>
                <Input
                    placeholder="Tìm kiếm nguyên liệu..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    size="large"
                />

                <Table
                    columns={columns}
                    dataSource={ingredients}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nguyên liệu`,
                    }}
                />
            </Card>

            <Modal
                title={editingItem ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu mới'}
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
                        label="Tên nguyên liệu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="tag"
                        label="Tag"
                    >
                        <Input placeholder="hai_san, rau_cu, thit, v.v." />
                    </Form.Item>

                    <Form.Item
                        name="unit"
                        label="Đơn vị"
                        rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                    >
                        <Input placeholder="kg, lít, gói, v.v." />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={2} placeholder="Mô tả về nguyên liệu" />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        name="minThreshold"
                        label="Mức tối thiểu"
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        name="importPrice"
                        label="Giá nhập (VNĐ)"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="supplier"
                        label="Nhà cung cấp"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="URL hình ảnh"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

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

export default IngredientManagement;

import React, { useState, useEffect } from 'react';
import {
    Table as AntTable,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Tag,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
    Tabs,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { tableService, Table, CreateTableRequest, UpdateTableRequest } from '../../api';
import Card from '../common/Card';

const { TabPane } = Tabs;

const TableManagement: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number>(0);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async (floor?: number) => {
        setLoading(true);
        try {
            const params = floor ? { floor } : undefined;
            const { data } = await tableService.getAll(params);
            setTables(data);
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTable(null);
        form.resetFields();
        form.setFieldsValue({ floor: selectedFloor || 1 });
        setModalVisible(true);
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        form.setFieldsValue(table);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await tableService.delete(id);
            message.success('Xóa bàn thành công!');
            fetchTables();
        } catch (error) {
            console.error('Error deleting table:', error);
        }
    };

    const handleSubmit = async (values: CreateTableRequest) => {
        try {
            if (editingTable) {
                await tableService.update(editingTable._id, values as UpdateTableRequest);
                message.success('Cập nhật bàn thành công!');
            } else {
                await tableService.create(values);
                message.success('Tạo bàn thành công!');
            }

            setModalVisible(false);
            form.resetFields();
            fetchTables();
        } catch (error) {
            console.error('Error saving table:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'success';
            case 'occupied':
                return 'error';
            case 'reserved':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircleOutlined />;
            case 'occupied':
                return <CloseCircleOutlined />;
            case 'reserved':
                return <ClockCircleOutlined />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return 'Trống';
            case 'occupied':
                return 'Đang sử dụng';
            case 'reserved':
                return 'Đã đặt';
            default:
                return status;
        }
    };

    const columns: ColumnsType<Table> = [
        {
            title: 'Số bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            sorter: (a, b) => a.tableNumber - b.tableNumber,
            render: (num: number) => (
                <Tag icon={<TableOutlined />} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    Bàn {num}
                </Tag>
            ),
        },
        {
            title: 'Tầng',
            dataIndex: 'floor',
            key: 'floor',
            render: (floor: number) => `Tầng ${floor}`,
        },
        {
            title: 'Sức chứa',
            dataIndex: 'capacity',
            key: 'capacity',
            render: (capacity: number) => `${capacity} người`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record: Table) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa bàn?"
                        description="Bạn có chắc chắn muốn xóa bàn này?"
                        onConfirm={() => handleDelete(record._id)}
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

    const getTablesByFloor = (floor: number) => {
        return tables.filter((t) => t.floor === floor);
    };

    const getStatsByFloor = (floor: number) => {
        const floorTables = getTablesByFloor(floor);
        return {
            total: floorTables.length,
            available: floorTables.filter((t) => t.status === 'available').length,
            occupied: floorTables.filter((t) => t.status === 'occupied').length,
            reserved: floorTables.filter((t) => t.status === 'reserved').length,
        };
    };

    const allStats = {
        total: tables.length,
        available: tables.filter((t) => t.status === 'available').length,
        occupied: tables.filter((t) => t.status === 'occupied').length,
        reserved: tables.filter((t) => t.status === 'reserved').length,
    };

    const floors = Array.from(new Set(tables.map((t) => t.floor))).sort();

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Quản lý Bàn</h1>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>Quản lý bàn ăn theo tầng</p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng số bàn" value={allStats.total} prefix={<TableOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Bàn trống"
                            value={allStats.available}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang sử dụng"
                            value={allStats.occupied}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã đặt"
                            value={allStats.reserved}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Danh sách Bàn</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchTables} // hoặc reload function
                            loading={loading}
                        >
                            Tải lại
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Thêm bàn mới
                        </Button>
                    </div>
                </div>

                <Tabs
                    activeKey={selectedFloor.toString()}
                    onChange={(key) => {
                        const floor = parseInt(key as string);
                        setSelectedFloor(floor);
                        if (floor > 0) {
                            fetchTables(floor);
                        } else {
                            fetchTables();
                        }
                    }}
                    items={[
                        {
                            key: '0',
                            label: 'Tất cả',
                            children: (
                                <AntTable
                                    columns={columns}
                                    dataSource={tables}
                                    rowKey="_id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                />
                            ),
                        },
                        ...floors.filter((f): f is number => typeof f === 'number').map((floor) => {
                            const stats = getStatsByFloor(floor);
                            return {
                                key: floor.toString(),
                                label: (
                                    <span>
                                        Tầng {floor} ({stats.total})
                                    </span>
                                ),
                                children: (
                                    <>
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col span={8}>
                                                <Card size="small">
                                                    <Statistic
                                                        title="Trống"
                                                        value={stats.available}
                                                        valueStyle={{ color: '#3f8600', fontSize: 20 }}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col span={8}>
                                                <Card size="small">
                                                    <Statistic
                                                        title="Đang dùng"
                                                        value={stats.occupied}
                                                        valueStyle={{ color: '#cf1322', fontSize: 20 }}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col span={8}>
                                                <Card size="small">
                                                    <Statistic
                                                        title="Đã đặt"
                                                        value={stats.reserved}
                                                        valueStyle={{ color: '#faad14', fontSize: 20 }}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>
                                        <AntTable
                                            columns={columns}
                                            dataSource={getTablesByFloor(floor)}
                                            rowKey="_id"
                                            loading={loading}
                                            pagination={{ pageSize: 10 }}
                                        />
                                    </>
                                ),
                            };
                        }),
                    ]}
                />
            </Card>

            <Modal
                title={editingTable ? 'Chỉnh sửa Bàn' : 'Thêm Bàn mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editingTable ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="tableNumber"
                        label="Số bàn"
                        rules={[{ required: true, message: 'Vui lòng nhập số bàn!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 1" />
                    </Form.Item>

                    <Form.Item name="floor" label="Tầng" rules={[{ required: true, message: 'Vui lòng chọn tầng!' }]}>
                        <Select
                            placeholder="Chọn tầng"
                            options={[
                                { value: 1, label: 'Tầng 1' },
                                { value: 2, label: 'Tầng 2' },
                                { value: 3, label: 'Tầng 3' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="capacity"
                        label="Sức chứa"
                        rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} max={20} placeholder="VD: 4" addonAfter="người" />
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái" initialValue="available">
                        <Select
                            options={[
                                { value: 'available', label: 'Trống' },
                                { value: 'occupied', label: 'Đang sử dụng' },
                                { value: 'reserved', label: 'Đã đặt' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TableManagement;

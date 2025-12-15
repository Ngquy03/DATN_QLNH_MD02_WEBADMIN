import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Space,
    Tag,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    TagOutlined,
    PercentageOutlined,
    DollarOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { voucherService, Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '../../api';
import Card from '../common/Card';

const { RangePicker } = DatePicker;

const VoucherManagement: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const { data } = await voucherService.getAll();
            setVouchers(data);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingVoucher(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (voucher: Voucher) => {
        setEditingVoucher(voucher);
        form.setFieldsValue({
            ...voucher,
            dateRange: [dayjs(voucher.startDate), dayjs(voucher.endDate)],
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await voucherService.delete(id);
            message.success('Xóa voucher thành công!');
            fetchVouchers();
        } catch (error) {
            console.error('Error deleting voucher:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const [startDate, endDate] = values.dateRange;
            const voucherData = {
                code: values.code,
                discountType: values.discountType,
                discountValue: values.discountValue,
                minOrderValue: values.minOrderValue,
                maxDiscount: values.maxDiscount,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                usageLimit: values.usageLimit,
                description: values.description,
            };

            if (editingVoucher) {
                await voucherService.update(editingVoucher._id, voucherData as UpdateVoucherRequest);
                message.success('Cập nhật voucher thành công!');
            } else {
                await voucherService.create(voucherData as CreateVoucherRequest);
                message.success('Tạo voucher thành công!');
            }

            setModalVisible(false);
            form.resetFields();
            fetchVouchers();
        } catch (error) {
            console.error('Error saving voucher:', error);
        }
    };

    const toggleStatus = async (voucher: Voucher) => {
        try {
            await voucherService.update(voucher._id, { isActive: !voucher.isActive });
            message.success(`${voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} voucher thành công!`);
            fetchVouchers();
        } catch (error) {
            console.error('Error toggling voucher status:', error);
        }
    };

    const columns: ColumnsType<Voucher> = [
        {
            title: 'Mã Voucher',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => (
                <Tag icon={<TagOutlined />} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            render: (type: string, record: Voucher) => (
                <Space>
                    {type === 'percentage' ? (
                        <>
                            <PercentageOutlined style={{ color: '#52c41a' }} />
                            <span>{record.discountValue}%</span>
                        </>
                    ) : (
                        <>
                            <DollarOutlined style={{ color: '#1890ff' }} />
                            <span>{record.discountValue.toLocaleString()}đ</span>
                        </>
                    )}
                </Space>
            ),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (value: number) => `${value.toLocaleString()}đ`,
        },
        {
            title: 'Giảm tối đa',
            dataIndex: 'maxDiscount',
            key: 'maxDiscount',
            render: (value: number) => (value ? `${value.toLocaleString()}đ` : 'Không giới hạn'),
        },
        {
            title: 'Thời gian',
            key: 'duration',
            render: (_, record: Voucher) => (
                <div>
                    <div>{dayjs(record.startDate).format('DD/MM/YYYY')}</div>
                    <div style={{ color: '#999' }}>đến {dayjs(record.endDate).format('DD/MM/YYYY')}</div>
                </div>
            ),
        },
        {
            title: 'Sử dụng',
            key: 'usage',
            render: (_, record: Voucher) => (
                <span>
                    {record.usedCount} / {record.usageLimit}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean, record: Voucher) => (
                <Tag color={isActive ? 'success' : 'default'} style={{ cursor: 'pointer' }} onClick={() => toggleStatus(record)}>
                    {isActive ? 'Hoạt động' : 'Vô hiệu'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record: Voucher) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa voucher?"
                        description="Bạn có chắc chắn muốn xóa voucher này?"
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

    const activeVouchers = vouchers.filter((v) => v.isActive);
    const totalUsage = vouchers.reduce((sum, v) => sum + v.usedCount, 0);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Quản lý Voucher</h1>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>Quản lý mã giảm giá và khuyến mãi</p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số Voucher" value={vouchers.length} prefix={<TagOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Voucher đang hoạt động"
                            value={activeVouchers.length}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng lượt sử dụng" value={totalUsage} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Danh sách Voucher</h2>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchVouchers}
                        loading={loading}
                    >
                        Tải lại
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Tạo Voucher mới
                    </Button>
                </div>

                <Table columns={columns} dataSource={vouchers} rowKey="_id" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} />
            </Card>

            <Modal
                title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={700}
                okText={editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="code"
                        label="Mã Voucher"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã voucher!' },
                            { min: 3, message: 'Mã voucher phải có ít nhất 3 ký tự!' },
                        ]}
                    >
                        <Input placeholder="VD: SUMMER2024" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="discountType"
                                label="Loại giảm giá"
                                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
                            >
                                <Select
                                    placeholder="Chọn loại giảm giá"
                                    options={[
                                        { value: 'percentage', label: 'Phần trăm (%)' },
                                        { value: 'fixed', label: 'Số tiền cố định (đ)' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="discountValue"
                                label="Giá trị giảm"
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="VD: 20 hoặc 50000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="minOrderValue"
                                label="Giá trị đơn hàng tối thiểu"
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn hàng tối thiểu!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="VD: 100000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    addonAfter="đ"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="maxDiscount" label="Giảm tối đa (để trống nếu không giới hạn)">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="VD: 50000"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    addonAfter="đ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian hiệu lực"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian hiệu lực!' }]}
                    >
                        <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="usageLimit"
                        label="Số lượng voucher"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng voucher!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 100" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả về voucher..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default VoucherManagement;

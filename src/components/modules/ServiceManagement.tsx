import React, { useState, useEffect } from 'react';
import {
    Card,
    Tabs,
    Table,
    Tag,
    Statistic,
    Row,
    Col,
    Typography,
    Button,
    DatePicker,
    Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    TableOutlined,
    DollarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import serviceService, {
    ServingTable,
    WaitingPaymentOrder,
    Invoice,
    ServiceDashboard,
    CookingDish,
    OverdueDish,
} from '../../api/service.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ServiceManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState<ServiceDashboard | null>(null);

    // Waiter data
    const [servingTables, setServingTables] = useState<ServingTable[]>([]);
    const [waitingPayment, setWaitingPayment] = useState<WaitingPaymentOrder[]>([]);

    // Cashier data
    const [servingInvoices, setServingInvoices] = useState<Invoice[]>([]);
    const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);
    const [paidSummary, setPaidSummary] = useState<any>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('day'),
        dayjs().endOf('day'),
    ]);

    // Kitchen data
    const [cookingDishes, setCookingDishes] = useState<CookingDish[]>([]);
    const [overdueDishes, setOverdueDishes] = useState<OverdueDish[]>([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDashboard(),
                fetchServingTables(),
                fetchWaitingPayment(),
                fetchServingInvoices(),
                fetchPaidInvoices(),
                fetchCookingDishes(),
                fetchOverdueDishes(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
        try {
            const data = await serviceService.getDashboard();
            setDashboard(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        }
    };

    const fetchServingTables = async () => {
        try {
            const data = await serviceService.getServingTables();
            setServingTables(data);
        } catch (error) {
            console.error('Error fetching serving tables:', error);
        }
    };

    const fetchWaitingPayment = async () => {
        try {
            const data = await serviceService.getWaitingPayment();
            setWaitingPayment(data);
        } catch (error) {
            console.error('Error fetching waiting payment:', error);
        }
    };

    const fetchServingInvoices = async () => {
        try {
            const data = await serviceService.getServingInvoices();
            setServingInvoices(data);
        } catch (error) {
            console.error('Error fetching serving invoices:', error);
        }
    };

    const fetchPaidInvoices = async () => {
        try {
            const { data, summary } = await serviceService.getPaidInvoices(
                dateRange[0].toISOString(),
                dateRange[1].toISOString()
            );
            setPaidInvoices(data);
            setPaidSummary(summary);
        } catch (error) {
            console.error('Error fetching paid invoices:', error);
        }
    };

    const fetchCookingDishes = async () => {
        try {
            const data = await serviceService.getCookingDishes();
            setCookingDishes(data);
        } catch (error) {
            console.error('Error fetching cooking dishes:', error);
        }
    };

    const fetchOverdueDishes = async () => {
        try {
            const data = await serviceService.getOverdueDishes();
            setOverdueDishes(data);
        } catch (error) {
            console.error('Error fetching overdue dishes:', error);
        }
    };

    // Waiter columns
    const servingTablesColumns: ColumnsType<ServingTable> = [
        {
            title: 'Bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            render: (num) => <Tag color="blue">Bàn {num}</Tag>,
        },
        {
            title: 'Vị trí',
            dataIndex: 'location',
            key: 'location',
            render: (location) => location || 'N/A',
        },
        {
            title: 'Sức chứa',
            dataIndex: 'capacity',
            key: 'capacity',
            render: (cap) => `${cap} người`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color="processing">Đang phục vụ</Tag>
            ),
        },
    ];

    const waitingPaymentColumns: ColumnsType<WaitingPaymentOrder> = [
        {
            title: 'Bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            render: (table, record) => <Tag color="orange">Bàn {record.tableNumber || 'N/A'}</Tag>,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalAmount',
            key: 'finalAmount',
            render: (amount) => (
                <span style={{ fontWeight: 600, color: '#f5222d' }}>
                    {amount?.toLocaleString('vi-VN')}₫
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (status) => (
                <Tag color="warning">Chờ thanh toán</Tag>
            ),
        },
    ];

    // Cashier columns
    const servingInvoicesColumns: ColumnsType<Invoice> = [
        {
            title: 'Mã HĐ',
            dataIndex: '_id',
            key: '_id',
            render: (id) => id.slice(-6).toUpperCase(),
        },
        {
            title: 'Bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            render: (table, record) => `Bàn ${record.tableNumber || 'N/A'}`,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalAmount',
            key: 'finalAmount',
            render: (amount) => `${amount?.toLocaleString('vi-VN')}₫`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (status) => {
                const statusMap: any = {
                    pending: { color: 'default', text: 'Chờ xác nhận' },
                    confirmed: { color: 'processing', text: 'Đã xác nhận' },
                    preparing: { color: 'warning', text: 'Đang nấu' },
                    ready: { color: 'success', text: 'Sẵn sàng' },
                };
                const s = statusMap[status] || { color: 'default', text: status };
                return <Tag color={s.color}>{s.text}</Tag>;
            },
        },
    ];

    const paidInvoicesColumns: ColumnsType<Invoice> = [
        {
            title: 'Mã HĐ',
            dataIndex: '_id',
            key: '_id',
            render: (id) => id.slice(-6).toUpperCase(),
        },
        {
            title: 'Bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            render: (table, record) => `Bàn ${record.tableNumber || 'N/A'}`,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalAmount',
            key: 'finalAmount',
            render: (amount) => `${amount?.toLocaleString('vi-VN')}₫`,
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => method || 'Tiền mặt',
        },
        {
            title: 'Thời gian',
            dataIndex: 'paidAt',
            key: 'paidAt',
            render: (date) => dayjs(date).format('HH:mm DD/MM'),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: () => <Tag color="success">Đã thanh toán</Tag>,
        },
    ];

    // Kitchen columns
    const cookingDishesColumns: ColumnsType<CookingDish> = [
        {
            title: 'Bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            render: (num) => <Tag color="blue">Bàn {num}</Tag>,
        },
        {
            title: 'Món',
            dataIndex: 'menuItem',
            key: 'menuItem',
            render: (item) => item?.name || 'N/A',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap: any = {
                    pending: { color: 'default', text: 'Chờ nấu' },
                    preparing: { color: 'processing', text: 'Đang nấu' },
                };
                const s = statusMap[status] || { color: 'default', text: status };
                return <Tag color={s.color}>{s.text}</Tag>;
            },
        },
        {
            title: 'Thời gian đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('HH:mm DD/MM'),
        },
    ];

    const overdueDishesColumns: ColumnsType<OverdueDish> = [
        {
            title: 'Bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            render: (num) => <Tag color="red">Bàn {num}</Tag>,
        },
        {
            title: 'Món',
            dataIndex: 'menuItem',
            key: 'menuItem',
            render: (item) => item?.name || 'N/A',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Quá giờ',
            dataIndex: 'minutesOverdue',
            key: 'minutesOverdue',
            render: (minutes) => (
                <Tag color="error">{minutes} phút</Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color="warning">Đang nấu</Tag>
            ),
        },
        {
            title: 'Thời gian đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('HH:mm DD/MM'),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Quản Lý Phục Vụ & Thu Ngân
                </Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchAllData}
                    loading={loading}
                    size="large"
                >
                    Tải lại
                </Button>
            </div>

            {/* Dashboard Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Bàn Đang Phục Vụ"
                            value={dashboard?.servingTables || 0}
                            prefix={<TableOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Bàn Chờ Thanh Toán"
                            value={dashboard?.waitingPayment || 0}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="HĐ Đang Phục Vụ"
                            value={dashboard?.servingInvoices || 0}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="HĐ Đã Thanh Toán"
                            value={dashboard?.paidToday || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bếp Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Số Món Đang Nấu"
                            value={dashboard?.cookingDishes || 0}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Món Quá Thời Gian Chế Biến"
                            value={dashboard?.overdueDishes || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: dashboard?.overdueDishes ? '#ff4d4f' : '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>


            {/* Tabs */}
            <Tabs defaultActiveKey="1" size="large">
                {/* Waiter: Bàn đang phục vụ */}
                <Tabs.TabPane tab="Bàn Đang Phục Vụ" key="1">
                    <Card>
                        <Table
                            columns={servingTablesColumns}
                            dataSource={servingTables}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Tabs.TabPane>

                {/* Waiter: Bàn chờ thanh toán */}
                <Tabs.TabPane tab="Bàn Chờ Thanh Toán" key="2">
                    <Card>
                        <Table
                            columns={waitingPaymentColumns}
                            dataSource={waitingPayment}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Tabs.TabPane>

                {/* Cashier: HĐ đang phục vụ */}
                <Tabs.TabPane tab="HĐ Đang Phục Vụ" key="3">
                    <Card>
                        <Table
                            columns={servingInvoicesColumns}
                            dataSource={servingInvoices}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Tabs.TabPane>

                {/* Cashier: HĐ đã thanh toán */}
                <Tabs.TabPane tab="HĐ Đã Thanh Toán" key="4">
                    <Card>
                        <Space style={{ marginBottom: 16 }}>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates) {
                                        setDateRange([dates[0]!, dates[1]!]);
                                    }
                                }}
                                format="DD/MM/YYYY"
                            />
                            <Button type="primary" onClick={fetchPaidInvoices}>
                                Lọc
                            </Button>
                        </Space>

                        {paidSummary && (
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={12}>
                                    <Statistic
                                        title="Tổng số HĐ"
                                        value={paidSummary.total}
                                        prefix={<FileTextOutlined />}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Tổng doanh thu"
                                        value={paidSummary.totalAmount}
                                        suffix="₫"
                                        precision={0}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>
                        )}

                        <Table
                            columns={paidInvoicesColumns}
                            dataSource={paidInvoices}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Tabs.TabPane>

                {/* Kitchen: Món đang nấu */}
                <Tabs.TabPane tab="Món Đang Nấu" key="5">
                    <Card>
                        <Table
                            columns={cookingDishesColumns}
                            dataSource={cookingDishes}
                            rowKey={(record) => `${record.orderId}-${record.menuItem?._id}`}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Tabs.TabPane>

                {/* Kitchen: Món quá thời gian */}
                <Tabs.TabPane tab="Món Quá Thời Gian" key="6">
                    <Card>
                        <Table
                            columns={overdueDishesColumns}
                            dataSource={overdueDishes}
                            rowKey={(record) => `${record.orderId}-${record.menuItem?._id}`}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default ServiceManagement;

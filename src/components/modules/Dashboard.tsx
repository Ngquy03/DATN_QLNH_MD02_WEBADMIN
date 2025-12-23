import React, { useState, useEffect } from 'react';
import { Row, Col, Statistic, Typography, DatePicker, Space, Table, Tag, Spin, Empty } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    InboxOutlined,
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Card } from '../common';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { reportService, userService, menuService, ingredientService } from '../../api';
import type { DetailedReportResponse } from '../../api/report.service';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(7, 'days'),
        dayjs(),
    ]);
    const [reportData, setReportData] = useState<DetailedReportResponse | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMenuItems: 0,
        totalIngredients: 0,
        lowStockIngredients: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [startDate, endDate] = dateRange;

            // Fetch report data
            const report = await reportService.getDetailedReport(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
            setReportData(report);

            // Fetch other stats
            const [users, menuItems, ingredients] = await Promise.all([
                userService.getAll(),
                menuService.getAll(),
                ingredientService.getAll(),
            ]);

            const lowStock = ingredients.filter(
                (item: any) => item.quantity <= (item.minThreshold || 0)
            );

            setStats({
                totalUsers: users.length,
                totalMenuItems: menuItems.length,
                totalIngredients: ingredients.length,
                lowStockIngredients: lowStock.length,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const mainStats = [
        {
            title: 'Tổng doanh thu',
            value: reportData?.summary.totalRevenue || 0,
            formatter: formatCurrency,
            icon: <DollarOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
            color: '#fff0f6',
            suffix: '₫',
        },
        {
            title: 'Tổng đơn hàng',
            value: reportData?.summary.totalOrders || 0,
            icon: <ShoppingOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
            color: '#f6ffed',
        },
        {
            title: 'Giá trị TB/đơn',
            value: reportData?.summary.averageOrderValue || 0,
            formatter: formatCurrency,
            icon: <RiseOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
            color: '#e6f7ff',
            suffix: '₫',
        },
        {
            title: 'Tổng giảm giá',
            value: reportData?.summary.totalDiscountGiven || 0,
            formatter: formatCurrency,
            icon: <FallOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
            color: '#fff7e6',
            suffix: '₫',
        },
    ];

    const secondaryStats = [
        {
            title: 'Nhân viên',
            value: stats.totalUsers,
            icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
        },
        {
            title: 'Món ăn',
            value: stats.totalMenuItems,
            icon: <ShoppingOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
        },
        {
            title: 'Nguyên liệu',
            value: stats.totalIngredients,
            icon: <InboxOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
        },
        {
            title: 'Sắp hết hàng',
            value: stats.lowStockIngredients,
            icon: <InboxOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />,
            valueStyle: { color: stats.lowStockIngredients > 0 ? '#ff4d4f' : undefined },
        },
    ];

    const topDishesColumns = [
        {
            title: '#',
            key: 'rank',
            width: 50,
            render: (_: any, __: any, index: number) => (
                <Tag color={index < 3 ? 'gold' : 'default'}>
                    {index < 3 ? <TrophyOutlined /> : index + 1}
                </Tag>
            ),
        },
        {
            title: 'Tên món',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right' as const,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
    ];

    if (loading && !reportData) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Thống kê tổng quan
                </Title>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                    format="DD/MM/YYYY"
                    size="large"
                />
            </div>

            {/* Main Statistics */}
            <Row gutter={[16, 16]}>
                {mainStats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 12,
                                        backgroundColor: stat.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    formatter={stat.formatter}
                                    styles={{ value: { fontSize: 20, fontWeight: 600 } }}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Secondary Statistics */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {secondaryStats.map((stat, index) => (
                    <Col xs={12} sm={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                                valueStyle={stat.valueStyle}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>



            {/* Charts Section */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* Daily Revenue Chart */}
                <Col xs={24} lg={16}>
                    <Card title="Doanh thu theo ngày">
                        {reportData?.charts.dailyRevenue && reportData.charts.dailyRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reportData.charts.dailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => dayjs(value).format('DD/MM')}
                                    />
                                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Doanh thu"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        name="Số đơn"
                                        yAxisId={1}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Không có dữ liệu" />
                        )}
                    </Card>
                </Col>

                {/* Payment Methods Chart */}
                <Col xs={24} lg={8}>
                    <Card title="Phương thức thanh toán">
                        {reportData?.charts.paymentMethods && reportData.charts.paymentMethods.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={reportData.charts.paymentMethods}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ method, percent }) =>
                                            `${method}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                    >
                                        {reportData.charts.paymentMethods.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Không có dữ liệu" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {/* Hourly Revenue Chart */}
                <Col xs={24} lg={16}>
                    <Card title="Doanh thu theo giờ">
                        {reportData?.charts.hourlyRevenue && reportData.charts.hourlyRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.charts.hourlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" tickFormatter={(value) => `${value}h`} />
                                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(label) => `${label}:00`}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Không có dữ liệu" />
                        )}
                    </Card>
                </Col>

                {/* Top Dishes Table */}
                <Col xs={24} lg={8}>
                    <Card title="Top món bán chạy">
                        {reportData?.charts.topDishes && reportData.charts.topDishes.length > 0 ? (
                            <Table
                                columns={topDishesColumns}
                                dataSource={reportData.charts.topDishes}
                                pagination={false}
                                size="small"
                                scroll={{ y: 250 }}
                                rowKey="name"
                            />
                        ) : (
                            <Empty description="Không có dữ liệu" />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Summary Cards */}
            {reportData && (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="TB Doanh thu/Ngày"
                                value={reportData.summary.averageRevenuePerDay}
                                formatter={formatCurrency}
                                prefix={<ClockCircleOutlined />}
                                suffix="₫"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="TB Đơn hàng/Ngày"
                                value={reportData.summary.averageOrdersPerDay.toFixed(1)}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng số ngày"
                                value={reportData.summary.period}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tỷ lệ giảm giá"
                                value={
                                    reportData.summary.totalRevenue > 0
                                        ? (
                                            (reportData.summary.totalDiscountGiven /
                                                (reportData.summary.totalRevenue +
                                                    reportData.summary.totalDiscountGiven)) *
                                            100
                                        ).toFixed(1)
                                        : 0
                                }
                                suffix="%"
                                prefix={<FallOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default Dashboard;

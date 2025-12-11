import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card as AntCard,
    Statistic,
    Button,
    DatePicker,
    Space,
    Typography,
    message,
    Spin,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
    DownloadOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    PercentageOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
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
import { Card } from '../common';
import { reportService, DetailedReportResponse } from '../../api';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const Statistics: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<DetailedReportResponse | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('day'),
    ]);

    const fetchDetailedReport = async (start: Dayjs, end: Dayjs) => {
        setLoading(true);
        try {
            const startDate = start.format('YYYY-MM-DD');
            const endDate = end.format('YYYY-MM-DD');
            const data = await reportService.getDetailedReport(startDate, endDate);
            setReportData(data);
        } catch (error) {
            console.error('Error fetching detailed report:', error);
            message.error('Tải báo cáo thất bại!');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailedReport(dateRange[0], dateRange[1]);
    }, []);

    const handleDateRangeChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
            fetchDetailedReport(dates[0], dates[1]);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const rangePresets: {
        label: string;
        value: [Dayjs, Dayjs];
    }[] = [
            { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
            { label: 'Tuần này', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
            { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            { label: 'Năm nay', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
            { label: '7 ngày qua', value: [dayjs().subtract(7, 'day'), dayjs().endOf('day')] },
            { label: '30 ngày qua', value: [dayjs().subtract(30, 'day'), dayjs().endOf('day')] },
        ];

    const exportToExcel = () => {
        if (!reportData) {
            message.warning('Không có dữ liệu để xuất!');
            return;
        }

        try {
            import('xlsx').then((XLSX) => {
                const wb = XLSX.utils.book_new();

                // Sheet 1: Tổng quan
                const summaryData = [
                    ['BÁO CÁO THỐNG KÊ CHI TIẾT'],
                    ['Từ ngày:', dateRange[0].format('DD/MM/YYYY'), 'Đến ngày:', dateRange[1].format('DD/MM/YYYY')],
                    [],
                    ['TỔNG QUAN'],
                    ['Tổng doanh thu', reportData.summary.totalRevenue],
                    ['Tổng đơn hàng', reportData.summary.totalOrders],
                    ['Tổng giảm giá', reportData.summary.totalDiscountGiven],
                    ['Giá trị đơn hàng TB', reportData.summary.averageOrderValue],
                    ['Số ngày', reportData.summary.period],
                    ['Doanh thu TB/ngày', reportData.summary.averageRevenuePerDay],
                    ['Đơn hàng TB/ngày', reportData.summary.averageOrdersPerDay],
                ];
                const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

                // Sheet 2: Doanh thu theo ngày
                const dailyData = reportData.charts.dailyRevenue.map((item) => ({
                    'Ngày': item.date,
                    'Doanh thu': item.revenue,
                    'Số đơn hàng': item.orders,
                    'Giảm giá': item.discount,
                }));
                const ws2 = XLSX.utils.json_to_sheet(dailyData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Doanh thu theo ngày');

                // Sheet 3: Doanh thu theo giờ
                const hourlyData = reportData.charts.hourlyRevenue.map((item) => ({
                    'Giờ': `${item.hour}:00`,
                    'Doanh thu': item.revenue,
                    'Số đơn hàng': item.orders,
                }));
                const ws3 = XLSX.utils.json_to_sheet(hourlyData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Doanh thu theo giờ');

                // Sheet 4: Top món ăn
                const dishData = reportData.charts.topDishes.map((item, index) => ({
                    'Hạng': index + 1,
                    'Tên món': item.name,
                    'Số lượng bán': item.quantity,
                    'Doanh thu': item.revenue,
                }));
                const ws4 = XLSX.utils.json_to_sheet(dishData);
                XLSX.utils.book_append_sheet(wb, ws4, 'Top món ăn');

                // Sheet 5: Phương thức thanh toán
                const paymentData = reportData.charts.paymentMethods.map((item) => ({
                    'Phương thức': item.method === 'cash' ? 'Tiền mặt' : item.method === 'card' ? 'Thẻ' : item.method,
                    'Số lượng': item.count,
                    'Doanh thu': item.revenue,
                }));
                const ws5 = XLSX.utils.json_to_sheet(paymentData);
                XLSX.utils.book_append_sheet(wb, ws5, 'Phương thức thanh toán');

                // Generate filename
                const filename = `Bao_cao_chi_tiet_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}.xlsx`;
                XLSX.writeFile(wb, filename);
                message.success('Xuất báo cáo Excel thành công!');
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            message.error('Có lỗi khi xuất báo cáo Excel');
        }
    };

    if (loading && !reportData) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải báo cáo..." />
            </div>
        );
    }

    const hasData = reportData && reportData.summary.totalOrders > 0;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            Báo cáo Thống kê
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                presets={rangePresets}
                                format="DD/MM/YYYY"
                                size="large"
                                style={{ width: 300 }}
                            />
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={exportToExcel}
                                size="large"
                                disabled={!hasData}
                            >
                                Xuất Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            {!hasData && reportData ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <ShoppingCartOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                        <Title level={3} style={{ color: '#999' }}>
                            Không có dữ liệu trong khoảng thời gian này
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Không tìm thấy đơn hàng đã thanh toán từ{' '}
                            <strong>{dateRange[0].format('DD/MM/YYYY')}</strong> đến{' '}
                            <strong>{dateRange[1].format('DD/MM/YYYY')}</strong>
                        </Text>
                        <div style={{ marginTop: 24 }}>
                            <Text type="secondary">
                                💡 Gợi ý: Thử chọn khoảng thời gian khác hoặc đảm bảo có đơn hàng đã thanh toán trong hệ thống
                            </Text>
                        </div>
                    </div>
                </Card>
            ) : hasData ? (
                <>
                    {/* Summary Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <AntCard>
                                <Statistic
                                    title="Tổng Doanh Thu"
                                    value={reportData.summary.totalRevenue}
                                    precision={0}
                                    formatter={(value) => formatCurrency(Number(value))}
                                    prefix={<DollarOutlined />}
                                    valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                                />
                            </AntCard>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <AntCard>
                                <Statistic
                                    title="Tổng Đơn Hàng"
                                    value={reportData.summary.totalOrders}
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                                />
                            </AntCard>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <AntCard>
                                <Statistic
                                    title="Giá Trị TB/Đơn"
                                    value={reportData.summary.averageOrderValue}
                                    precision={0}
                                    formatter={(value) => formatCurrency(Number(value))}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ fontSize: '24px' }}
                                />
                            </AntCard>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <AntCard>
                                <Statistic
                                    title="Tổng Giảm Giá"
                                    value={reportData.summary.totalDiscountGiven}
                                    precision={0}
                                    formatter={(value) => formatCurrency(Number(value))}
                                    prefix={<PercentageOutlined />}
                                    valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                                />
                            </AntCard>
                        </Col>
                    </Row>

                    {/* Additional Stats */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={8}>
                            <AntCard>
                                <Statistic
                                    title="Số Ngày"
                                    value={reportData.summary.period}
                                    suffix="ngày"
                                />
                            </AntCard>
                        </Col>
                        <Col xs={24} sm={8}>
                            <AntCard>
                                <Statistic
                                    title="Doanh Thu TB/Ngày"
                                    value={reportData.summary.averageRevenuePerDay}
                                    precision={0}
                                    formatter={(value) => formatCurrency(Number(value))}
                                />
                            </AntCard>
                        </Col>
                        <Col xs={24} sm={8}>
                            <AntCard>
                                <Statistic
                                    title="Đơn Hàng TB/Ngày"
                                    value={reportData.summary.averageOrdersPerDay}
                                    precision={1}
                                    suffix="đơn"
                                />
                            </AntCard>
                        </Col>
                    </Row>

                    {/* Charts */}
                    <Row gutter={[16, 16]}>
                        {/* Daily Revenue Chart */}
                        <Col xs={24} lg={12}>
                            <Card>
                                <Title level={4}>Doanh Thu Theo Ngày</Title>
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
                                            name="Doanh thu"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        {/* Hourly Revenue Chart */}
                        <Col xs={24} lg={12}>
                            <Card>
                                <Title level={4}>Doanh Thu Theo Giờ</Title>
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
                                        <Bar dataKey="revenue" name="Doanh thu" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        {/* Top Dishes Chart */}
                        {reportData.charts.topDishes.length > 0 && (
                            <Col xs={24} lg={12}>
                                <Card>
                                    <Title level={4}>Top 10 Món Ăn Bán Chạy</Title>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={reportData.charts.topDishes}
                                            layout="vertical"
                                            margin={{ left: 100 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                            <YAxis type="category" dataKey="name" width={100} />
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="revenue" name="Doanh thu" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        )}

                        {/* Payment Methods Chart */}
                        {reportData.charts.paymentMethods.length > 0 && (
                            <Col xs={24} lg={12}>
                                <Card>
                                    <Title level={4}>Phương Thức Thanh Toán</Title>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.charts.paymentMethods as any}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ method, percent }) =>
                                                    `${method === 'cash' ? 'Tiền mặt' : method === 'card' ? 'Thẻ' : method}: ${(
                                                        percent * 100
                                                    ).toFixed(0)}%`
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
                                </Card>
                            </Col>
                        )}
                    </Row>
                </>
            ) : null}
        </div>
    );
};

export default Statistics;

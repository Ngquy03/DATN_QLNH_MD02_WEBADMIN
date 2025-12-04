import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    Typography,
    message,
    Popconfirm,
    Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    DeleteOutlined,
    CalendarOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { Card, PageLoader } from '../common';
import { reportService, Report, CreateDailyReportRequest, CreateWeeklyReportRequest } from '../../api';

const { Title } = Typography;

const Statistics: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const data = await reportService.getAll();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            message.error('Tải báo cáo thất bại!');
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const getWeekRange = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const startDate = new Date(now);
        startDate.setDate(now.getDate() + mondayOffset);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const toISO = (date: Date) => date.toISOString().split('T')[0];

        return { startDate: toISO(startDate), endDate: toISO(endDate) };
    };

    const handleCreateReport = async (type: 'daily' | 'weekly') => {
        setIsCreating(true);
        try {
            if (type === 'daily') {
                const body: CreateDailyReportRequest = {
                    reportDate: new Date().toISOString().split('T')[0]
                };
                await reportService.createDaily(body);
                message.success('Tạo báo cáo ngày thành công!');
            } else {
                const body: CreateWeeklyReportRequest = getWeekRange();
                await reportService.createWeekly(body);
                message.success('Tạo báo cáo tuần thành công!');
            }
            fetchReports();
        } catch (error) {
            console.error('Error creating report:', error);
            message.error(`Tạo báo cáo ${type === 'daily' ? 'ngày' : 'tuần'} thất bại!`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        try {
            await reportService.delete(reportId);
            message.success('Xóa báo cáo thành công!');
            fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            message.error('Xóa báo cáo thất bại!');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getReportTypeLabel = (type: string) => {
        switch (type) {
            case 'daily_report':
                return 'Báo cáo ngày';
            case 'weekly_report':
                return 'Báo cáo tuần';
            default:
                return type;
        }
    };

    const getReportTypeColor = (type: string) => {
        switch (type) {
            case 'daily_report':
                return 'blue';
            case 'weekly_report':
                return 'green';
            default:
                return 'default';
        }
    };

    const exportToExcel = () => {
        try {
            import('xlsx').then((XLSX) => {
                if (reports.length === 0) {
                    message.warning('Không có báo cáo nào để xuất!');
                    return;
                }

                // Prepare data for Excel
                const excelData = reports.map(report => ({
                    'Loại báo cáo': getReportTypeLabel(report.reportType),
                    'Ngày tạo': formatDate(report.generatedAt),
                    'Tổng doanh thu (VNĐ)': report.totalRevenue,
                    'Tổng đơn hàng': report.totalOrders,
                    'Doanh thu trung bình/đơn (VNĐ)': report.totalOrders > 0
                        ? Math.round(report.totalRevenue / report.totalOrders)
                        : 0,
                }));

                // Create worksheet
                const ws = XLSX.utils.json_to_sheet(excelData);

                // Set column widths
                ws['!cols'] = [
                    { wch: 20 }, // Loại báo cáo
                    { wch: 20 }, // Ngày tạo
                    { wch: 25 }, // Tổng doanh thu
                    { wch: 18 }, // Tổng đơn hàng
                    { wch: 28 }, // Doanh thu TB
                ];

                // Add summary row
                const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
                const totalOrders = reports.reduce((sum, r) => sum + r.totalOrders, 0);

                const summaryData = [
                    {},
                    {
                        'Loại báo cáo': 'TỔNG CỘNG',
                        'Ngày tạo': '',
                        'Tổng doanh thu (VNĐ)': totalRevenue,
                        'Tổng đơn hàng': totalOrders,
                        'Doanh thu trung bình/đơn (VNĐ)': totalOrders > 0
                            ? Math.round(totalRevenue / totalOrders)
                            : 0,
                    }
                ];

                XLSX.utils.sheet_add_json(ws, summaryData, {
                    skipHeader: true,
                    origin: -1
                });

                // Create workbook
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo thống kê');

                // Generate filename with current date
                const date = new Date();
                const filename = `Bao_cao_thong_ke_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.xlsx`;

                // Save file
                XLSX.writeFile(wb, filename);
                message.success(`Đã xuất ${reports.length} báo cáo thành công!`);
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            message.error('Có lỗi khi xuất báo cáo Excel');
        }
    };

    const columns: ColumnsType<Report> = [
        {
            title: 'Loại báo cáo',
            dataIndex: 'reportType',
            key: 'reportType',
            render: (type: string) => (
                <Tag color={getReportTypeColor(type)}>
                    {getReportTypeLabel(type)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'generatedAt',
            key: 'generatedAt',
            render: (date: string) => formatDate(date),
        },
        {
            title: 'Tổng doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            align: 'right',
            render: (revenue: number) => (
                <span style={{ fontWeight: 600, color: '#52c41a' }}>
                    {formatCurrency(revenue)}
                </span>
            ),
        },
        {
            title: 'Tổng đơn hàng',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            align: 'right',
            render: (orders: number) => (
                <span style={{ fontWeight: 600 }}>
                    {orders.toLocaleString('vi-VN')}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Popconfirm
                        title="Xóa báo cáo"
                        description="Bạn có chắc chắn muốn xóa báo cáo này?"
                        onConfirm={() => handleDeleteReport(record._id)}
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

    if (loading && reports.length === 0) {
        return <PageLoader />;
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Thống kê Báo cáo
                </Title>
                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={exportToExcel}
                        size="large"
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => handleCreateReport('daily')}
                        loading={isCreating}
                        size="large"
                    >
                        Tạo Báo cáo Hôm nay
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateReport('weekly')}
                        loading={isCreating}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        size="large"
                    >
                        Tạo Báo cáo Tuần này
                    </Button>
                </Space>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={reports}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} báo cáo`,
                    }}
                    locale={{
                        emptyText: 'Không có báo cáo nào',
                    }}
                />
            </Card>
        </div>
    );
};

export default Statistics;

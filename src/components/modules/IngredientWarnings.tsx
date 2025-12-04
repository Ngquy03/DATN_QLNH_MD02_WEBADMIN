import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Progress,
    Space,
    Button,
    message,
    Statistic,
    Row,
    Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    WarningOutlined,
    ReloadOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { Card, PageLoader } from '../common';
import { ingredientService, Ingredient } from '../../api';

const IngredientWarnings: React.FC = () => {
    const [warnings, setWarnings] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWarnings = async () => {
        setLoading(true);
        try {
            const data = await ingredientService.getWarnings();
            setWarnings(data);
        } catch (error) {
            console.error('Error fetching warnings:', error);
            message.error('Không thể tải danh sách cảnh báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarnings();
    }, []);

    const getStockStatus = (quantity: number, minThreshold: number = 0) => {
        const percentage = minThreshold > 0 ? (quantity / minThreshold) * 100 : 100;
        if (percentage <= 50) return { color: 'red', text: 'Hết hàng', percent: percentage };
        if (percentage <= 100) return { color: 'orange', text: 'Sắp hết', percent: percentage };
        return { color: 'green', text: 'Đủ', percent: 100 };
    };

    const exportToExcel = () => {
        try {
            import('xlsx').then((XLSX) => {
                if (warnings.length === 0) {
                    message.warning('Không có dữ liệu để xuất!');
                    return;
                }

                const excelData = warnings.map(item => ({
                    'Tên nguyên liệu': item.name,
                    'Danh mục': item.category || '-',
                    'Số lượng hiện tại': `${item.quantity} ${item.unit}`,
                    'Mức tối thiểu': `${item.minThreshold || 0} ${item.unit}`,
                    'Tình trạng': getStockStatus(item.quantity, item.minThreshold).text,
                    'Nhà cung cấp': item.supplier || '-',
                    'Giá nhập': item.importPrice ? `${item.importPrice.toLocaleString()}đ` : '-',
                }));

                const ws = XLSX.utils.json_to_sheet(excelData);
                ws['!cols'] = [
                    { wch: 25 },
                    { wch: 20 },
                    { wch: 18 },
                    { wch: 18 },
                    { wch: 15 },
                    { wch: 20 },
                    { wch: 15 },
                ];

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Cảnh báo nguyên liệu');

                const date = new Date();
                const filename = `Canh_bao_nguyen_lieu_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.xlsx`;

                XLSX.writeFile(wb, filename);
                message.success('Đã xuất báo cáo thành công!');
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            message.error('Có lỗi khi xuất báo cáo Excel');
        }
    };

    const columns: ColumnsType<Ingredient> = [
        {
            title: 'Tên nguyên liệu',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Ingredient) => (
                <Space>
                    <WarningOutlined
                        style={{
                            color: getStockStatus(record.quantity, record.minThreshold).color === 'red'
                                ? '#ff4d4f'
                                : '#faad14',
                            fontSize: 18
                        }}
                    />
                    <span style={{ fontWeight: 600 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => {
                const categoryMap: Record<string, string> = {
                    'kho': 'Thực phẩm khô',
                    'tuoi': 'Thực phẩm tươi sống',
                    'gia_vi': 'Gia vị',
                    'do_uong': 'Đồ uống',
                };
                return categoryMap[category] || category || '-';
            },
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            render: (_, record: Ingredient) => (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {record.quantity} {record.unit}
                    </div>
                    <Progress
                        percent={getStockStatus(record.quantity, record.minThreshold).percent}
                        size="small"
                        status={
                            getStockStatus(record.quantity, record.minThreshold).color === 'red'
                                ? 'exception'
                                : 'normal'
                        }
                        strokeColor={
                            getStockStatus(record.quantity, record.minThreshold).color === 'red'
                                ? '#ff4d4f'
                                : '#faad14'
                        }
                    />
                </div>
            ),
        },
        {
            title: 'Mức tối thiểu',
            dataIndex: 'minThreshold',
            key: 'minThreshold',
            render: (threshold: number, record: Ingredient) =>
                `${threshold || 0} ${record.unit}`,
        },
        {
            title: 'Tình trạng',
            key: 'status',
            render: (_, record: Ingredient) => {
                const status = getStockStatus(record.quantity, record.minThreshold);
                return (
                    <Tag color={status.color === 'red' ? 'red' : 'orange'}>
                        {status.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
            render: (supplier: string) => supplier || '-',
        },
        {
            title: 'Giá nhập',
            dataIndex: 'importPrice',
            key: 'importPrice',
            align: 'right',
            render: (price: number) =>
                price ? `${price.toLocaleString()}đ` : '-',
        },
    ];

    const outOfStock = warnings.filter(w =>
        getStockStatus(w.quantity, w.minThreshold).color === 'red'
    ).length;

    const lowStock = warnings.filter(w =>
        getStockStatus(w.quantity, w.minThreshold).color === 'orange'
    ).length;

    if (loading && warnings.length === 0) {
        return <PageLoader />;
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
                    Cảnh báo Nguyên liệu
                </h1>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>
                    Danh sách nguyên liệu sắp hết hoặc đã hết hàng
                </p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng cảnh báo"
                            value={warnings.length}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Hết hàng"
                            value={outOfStock}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Sắp hết"
                            value={lowStock}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                        Danh sách cảnh báo
                    </h2>
                    <Space>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={exportToExcel}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={fetchWarnings}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={warnings}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nguyên liệu`,
                    }}
                    locale={{
                        emptyText: 'Không có cảnh báo nào',
                    }}
                />
            </Card>
        </div>
    );
};

export default IngredientWarnings;

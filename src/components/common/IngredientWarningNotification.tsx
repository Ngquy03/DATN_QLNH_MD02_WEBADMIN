import React, { useState, useEffect } from 'react';
import { Badge, Popover, Button, List, Tag, Empty, message } from 'antd';
import { BellOutlined, WarningOutlined, EyeOutlined } from '@ant-design/icons';
import { ingredientService, Ingredient } from '../../api';

interface IngredientWarningNotificationProps {
    onViewAll?: () => void;
}

const IngredientWarningNotification: React.FC<IngredientWarningNotificationProps> = ({ onViewAll }) => {
    const [warnings, setWarnings] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const fetchWarnings = async () => {
        setLoading(true);
        try {
            const data = await ingredientService.getWarnings();
            setWarnings(data);
        } catch (error) {
            console.error('Error fetching warnings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarnings();
        // Tự động refresh mỗi 5 phút
        const interval = setInterval(fetchWarnings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status?: string) => {
        if (status === 'out_of_stock') return 'red';
        if (status === 'low_stock') return 'orange';
        return 'default';
    };

    const getStatusText = (status?: string) => {
        if (status === 'out_of_stock') return 'Hết hàng';
        if (status === 'low_stock') return 'Sắp hết';
        return 'Bình thường';
    };

    const content = (
        <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
            {warnings.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có cảnh báo nào"
                />
            ) : (
                <List
                    dataSource={warnings}
                    renderItem={(item: Ingredient) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <WarningOutlined
                                        style={{
                                            fontSize: 24,
                                            color: getStatusColor(item.status) === 'red' ? '#ff4d4f' : '#faad14'
                                        }}
                                    />
                                }
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                                        <Tag color={getStatusColor(item.status)}>
                                            {getStatusText(item.status)}
                                        </Tag>
                                    </div>
                                }
                                description={
                                    <div>
                                        <div>Còn lại: <strong>{item.quantity} {item.unit}</strong></div>
                                        {item.minThreshold && (
                                            <div style={{ fontSize: 12, color: '#999' }}>
                                                Mức tối thiểu: {item.minThreshold} {item.unit}
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
            {warnings.length > 0 && onViewAll && (
                <div style={{ marginTop: 12, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setVisible(false);
                            onViewAll();
                        }}
                        block
                    >
                        Xem tất cả cảnh báo
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Cảnh báo nguyên liệu</span>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            fetchWarnings();
                            message.success('Đã làm mới danh sách cảnh báo');
                        }}
                    >
                        Làm mới
                    </Button>
                </div>
            }
            trigger="click"
            open={visible}
            onOpenChange={setVisible}
            placement="bottomRight"
        >
            <Badge count={warnings.length} offset={[-5, 5]}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 20 }} />}
                    loading={loading}
                    style={{
                        color: warnings.length > 0 ? '#faad14' : 'inherit',
                        fontSize: 20
                    }}
                />
            </Badge>
        </Popover>
    );
};

export default IngredientWarningNotification;

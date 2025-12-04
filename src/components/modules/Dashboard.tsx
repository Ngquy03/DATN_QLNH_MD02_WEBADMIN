import React from 'react';
import { Row, Col, Statistic, Typography } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    InboxOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { Card } from '../common';

const { Title } = Typography;

const Dashboard: React.FC = () => {
    // Mock data - sẽ thay bằng API call thực tế
    const stats = [
        {
            title: 'Tổng nhân viên',
            value: 24,
            icon: <UserOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
            color: '#e6f7ff',
        },
        {
            title: 'Món ăn',
            value: 156,
            icon: <ShoppingOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
            color: '#f6ffed',
        },
        {
            title: 'Nguyên liệu',
            value: 89,
            icon: <InboxOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
            color: '#fff7e6',
        },
        {
            title: 'Doanh thu tháng',
            value: 125000000,
            prefix: '₫',
            icon: <DollarOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
            color: '#fff0f6',
        },
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                Thống kê tổng quan ( Đang phát triển)
            </Title>

            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
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
                                    prefix={stat.prefix}
                                    styles={{ value: { fontSize: 24, fontWeight: 600 } }}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Biểu đồ doanh thu" style={{ height: 400 }}>
                        <div
                            style={{
                                height: 320,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                            }}
                        >
                            Biểu đồ sẽ được hiển thị tại đây
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Hoạt động gần đây" style={{ height: 400 }}>
                        <div
                            style={{
                                height: 320,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                            }}
                        >
                            Danh sách hoạt động
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;

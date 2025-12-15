import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Select,
    Space,
    Tag,
    message,
    Row,
    Col,
    Statistic,
    DatePicker,
    Descriptions,
    Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    HistoryOutlined,
    SearchOutlined,
    EyeOutlined,
    ReloadOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { activityService, ActivityLog, ActivityLogFilters } from '../../api';
import Card from '../common/Card';

const { RangePicker } = DatePicker;

const ActivityLogs: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async (values: any = {}) => {
        setLoading(true);
        try {
            const filters: ActivityLogFilters = {};
            if (values.action) filters.action = values.action;
            if (values.resource) filters.resource = values.resource;
            if (values.dateRange) {
                filters.startDate = values.dateRange[0].format('YYYY-MM-DD');
                filters.endDate = values.dateRange[1].format('YYYY-MM-DD');
            }

            const { data } = await activityService.getAll(filters);
            setLogs(data);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            message.error('Không thể tải lịch sử hoạt động');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (values: any) => {
        fetchLogs(values);
    };

    const handleViewDetails = (log: ActivityLog) => {
        setSelectedLog(log);
        setDetailsVisible(true);
    };

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return 'green';
            case 'UPDATE':
                return 'blue';
            case 'DELETE':
                return 'red';
            case 'LOGIN':
                return 'cyan';
            case 'LOGOUT':
                return 'orange';
            default:
                return 'default';
        }
    };

    const columns: ColumnsType<ActivityLog> = [
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm:ss'),
            sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <UserOutlined />
                    <span>{record.userName}</span>
                    <Tag>{record.userRole}</Tag>
                </Space>
            ),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <Tag color={getActionColor(text)}>{text}</Tag>,
        },
        {
            title: 'Tài nguyên',
            dataIndex: 'resource',
            key: 'resource',
            render: (text) => <Tag color="purple">{text}</Tag>,
        },
        {
            title: 'Chi tiết',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
                    Xem
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Lịch sử Hoạt động</h1>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>Theo dõi các thao tác trong hệ thống</p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng số hoạt động"
                            value={logs.length}
                            prefix={<HistoryOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Hoạt động hôm nay"
                            value={logs.filter(l => dayjs(l.timestamp).isSame(dayjs(), 'day')).length}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<SafetyCertificateOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Form
                    form={form}
                    layout="inline"
                    onFinish={handleFilter}
                    style={{ marginBottom: 24 }}
                >
                    <Form.Item name="action">
                        <Select
                            placeholder="Hành động"
                            style={{ width: 150 }}
                            allowClear
                            options={[
                                { value: 'CREATE', label: 'Tạo mới' },
                                { value: 'UPDATE', label: 'Cập nhật' },
                                { value: 'DELETE', label: 'Xóa' },
                                { value: 'LOGIN', label: 'Đăng nhập' },
                                { value: 'LOGOUT', label: 'Đăng xuất' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="resource">
                        <Select
                            placeholder="Tài nguyên"
                            style={{ width: 150 }}
                            allowClear
                            options={[
                                { value: 'USER', label: 'Người dùng' },
                                { value: 'ORDER', label: 'Đơn hàng' },
                                { value: 'MENU', label: 'Thực đơn' },
                                { value: 'INGREDIENT', label: 'Nguyên liệu' },
                                { value: 'TABLE', label: 'Bàn' },
                                { value: 'VOUCHER', label: 'Voucher' },
                                { value: 'SHIFT', label: 'Ca làm việc' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="dateRange">
                        <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            Tìm kiếm
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button icon={<ReloadOutlined />} onClick={() => {
                            form.resetFields();
                            fetchLogs();
                        }}>
                            Làm mới
                        </Button>
                    </Form.Item>
                </Form>

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Chi tiết hoạt động"
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {selectedLog && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Thời gian">
                            {dayjs(selectedLog.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người thực hiện">
                            {selectedLog.userName} ({selectedLog.userRole})
                        </Descriptions.Item>
                        <Descriptions.Item label="Hành động">
                            <Tag color={getActionColor(selectedLog.action)}>{selectedLog.action}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tài nguyên">
                            <Tag color="purple">{selectedLog.resource}</Tag>
                        </Descriptions.Item>
                        {selectedLog.resourceId && (
                            <Descriptions.Item label="ID Tài nguyên">
                                {selectedLog.resourceId}
                            </Descriptions.Item>
                        )}
                        {selectedLog.ipAddress && (
                            <Descriptions.Item label="IP Address">
                                {selectedLog.ipAddress}
                            </Descriptions.Item>
                        )}
                        {selectedLog.details && (
                            <Descriptions.Item label="Chi tiết thay đổi">
                                <pre style={{
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    background: '#f5f5f5',
                                    padding: 10,
                                    borderRadius: 4,
                                    border: '1px solid #d9d9d9'
                                }}>
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ActivityLogs;

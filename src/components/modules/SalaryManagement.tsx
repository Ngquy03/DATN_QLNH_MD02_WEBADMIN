import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    InputNumber,
    Select,
    Space,
    Tag,
    message,
    Row,
    Col,
    Statistic,
    DatePicker,
    Tabs,
    Card,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    DollarOutlined,
    UserOutlined,
    CalculatorOutlined,
    HistoryOutlined,
    EditOutlined,
    BankOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { salaryService, userService, SalaryConfig, SalaryCalculation } from '../../api';
import CustomCard from '../common/Card';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const SalaryManagement: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [salaryConfigs, setSalaryConfigs] = useState<Record<string, SalaryConfig>>({});
    const [loading, setLoading] = useState(false);
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [calculateModalVisible, setCalculateModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [calculationResult, setCalculationResult] = useState<SalaryCalculation | null>(null);
    const [monthlyReport, setMonthlyReport] = useState<SalaryCalculation[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [form] = Form.useForm();
    const [calculateForm] = Form.useForm();

    useEffect(() => {
        fetchEmployees();
        fetchMonthlyReport();
    }, []);

    useEffect(() => {
        if (employees.length > 0) {
            fetchSalaryConfigs();
        }
    }, [employees]);

    useEffect(() => {
        fetchMonthlyReport();
    }, [selectedMonth]);

    const fetchEmployees = async () => {
        try {
            const response = await userService.getAll();
            const users = Array.isArray(response) ? response : (response as any).data || [];
            setEmployees(users.filter((u: any) => u.role !== 'admin'));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchSalaryConfigs = async () => {
        const configs: Record<string, SalaryConfig> = {};
        for (const emp of employees) {
            try {
                const config = await salaryService.getEmployeeConfig(emp.id || emp._id);
                if (config) {
                    configs[emp.id || emp._id] = config;
                }
            } catch (error) {
                // Ignore error if config not found
            }
        }
        setSalaryConfigs(configs);
    };

    const fetchMonthlyReport = async () => {
        setLoading(true);
        try {
            const report = await salaryService.getMonthlyReport(
                selectedMonth.month() + 1,
                selectedMonth.year()
            );
            setMonthlyReport(report);
        } catch (error) {
            console.error('Error fetching monthly report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigEdit = (employee: any) => {
        setSelectedEmployee(employee);
        const config = salaryConfigs[employee.id || employee._id];
        form.resetFields();
        if (config) {
            form.setFieldsValue({
                hourlyRate: config.hourlyRate,
                dailyRate: config.dailyRate,
                monthlyRate: config.monthlyRate,
                effectiveFrom: dayjs(config.effectiveFrom),
            });
        } else {
            form.setFieldsValue({
                effectiveFrom: dayjs(),
            });
        }
        setConfigModalVisible(true);
    };

    const handleConfigSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                effectiveFrom: values.effectiveFrom.format('YYYY-MM-DD'),
            };
            await salaryService.updateConfig(selectedEmployee.id || selectedEmployee._id, data);
            message.success('Cập nhật cấu hình lương thành công!');
            setConfigModalVisible(false);
            fetchSalaryConfigs();
        } catch (error) {
            console.error('Error updating salary config:', error);
            message.error('Có lỗi xảy ra khi cập nhật cấu hình lương');
        }
    };

    const handleCalculate = () => {
        setCalculationResult(null);
        calculateForm.resetFields();
        setCalculateModalVisible(true);
    };

    const handleCalculateSubmit = async (values: any) => {
        try {
            const [startDate, endDate] = values.dateRange;
            const result = await salaryService.calculate({
                employeeId: values.employeeId,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
            });
            setCalculationResult(result);
            message.success('Tính lương thành công!');
        } catch (error) {
            console.error('Error calculating salary:', error);
            message.error('Có lỗi xảy ra khi tính lương');
        }
    };

    const employeeColumns: ColumnsType<any> = [
        {
            title: 'Nhân viên',
            key: 'name',
            render: (_, record) => (
                <Space>
                    <UserOutlined />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{record.username}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => <Tag color="blue">{role}</Tag>,
        },
        {
            title: 'Lương theo giờ',
            key: 'hourlyRate',
            render: (_, record) => {
                const config = salaryConfigs[record.id || record._id];
                return config?.hourlyRate ? `${config.hourlyRate.toLocaleString()}đ` : '-';
            },
        },
        {
            title: 'Lương theo ngày',
            key: 'dailyRate',
            render: (_, record) => {
                const config = salaryConfigs[record.id || record._id];
                return config?.dailyRate ? `${config.dailyRate.toLocaleString()}đ` : '-';
            },
        },
        {
            title: 'Lương cứng',
            key: 'monthlyRate',
            render: (_, record) => {
                const config = salaryConfigs[record.id || record._id];
                return config?.monthlyRate ? `${config.monthlyRate.toLocaleString()}đ` : '-';
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleConfigEdit(record)}>
                    Cấu hình
                </Button>
            ),
        },
    ];

    const reportColumns: ColumnsType<SalaryCalculation> = [
        {
            title: 'Nhân viên',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Tổng giờ làm',
            dataIndex: 'totalHours',
            key: 'totalHours',
            render: (hours) => `${hours.toFixed(2)}h`,
        },
        {
            title: 'Lương theo giờ',
            dataIndex: 'hourlyPay',
            key: 'hourlyPay',
            render: (value) => `${value.toLocaleString()}đ`,
        },
        {
            title: 'Lương theo ngày',
            dataIndex: 'dailyPay',
            key: 'dailyPay',
            render: (value) => `${value.toLocaleString()}đ`,
        },
        {
            title: 'Lương cứng',
            dataIndex: 'monthlyPay',
            key: 'monthlyPay',
            render: (value) => `${value.toLocaleString()}đ`,
        },
        {
            title: 'Tổng lương',
            dataIndex: 'totalSalary',
            key: 'totalSalary',
            render: (value) => (
                <span style={{ color: '#cf1322', fontWeight: 600 }}>
                    {value.toLocaleString()}đ
                </span>
            ),
        },
    ];

    const totalSalaryPayout = monthlyReport.reduce((sum, item) => sum + item.totalSalary, 0);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Quản lý Lương</h1>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>Cấu hình và tính lương nhân viên</p>
            </div>

            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: (
                            <span>
                                <BankOutlined />
                                Cấu hình Lương
                            </span>
                        ),
                        children: (
                            <CustomCard>
                                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Danh sách Nhân viên</h2>
                                    <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculate}>
                                        Tính lương nhanh
                                    </Button>
                                </div>
                                <Table
                                    columns={employeeColumns}
                                    dataSource={employees}
                                    rowKey={(record) => record.id || record._id}
                                    pagination={{ pageSize: 10 }}
                                />
                            </CustomCard>
                        ),
                    },
                    {
                        key: '2',
                        label: (
                            <span>
                                <HistoryOutlined />
                                Báo cáo Lương tháng
                            </span>
                        ),
                        children: (
                            <>
                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col span={8}>
                                        <CustomCard>
                                            <Statistic
                                                title="Tổng chi lương tháng này"
                                                value={totalSalaryPayout}
                                                precision={0}
                                                valueStyle={{ color: '#cf1322' }}
                                                prefix={<DollarOutlined />}
                                                suffix="đ"
                                            />
                                        </CustomCard>
                                    </Col>
                                    <Col span={8}>
                                        <CustomCard>
                                            <Statistic
                                                title="Số nhân viên được tính"
                                                value={monthlyReport.length}
                                                prefix={<UserOutlined />}
                                            />
                                        </CustomCard>
                                    </Col>
                                    <Col span={8}>
                                        <CustomCard>
                                            <div style={{ marginBottom: 8 }}>Chọn tháng báo cáo</div>
                                            <DatePicker
                                                picker="month"
                                                value={selectedMonth}
                                                onChange={(date) => date && setSelectedMonth(date)}
                                                style={{ width: '100%' }}
                                                format="MM/YYYY"
                                            />
                                        </CustomCard>
                                    </Col>
                                </Row>

                                <CustomCard>
                                    <Table
                                        columns={reportColumns}
                                        dataSource={monthlyReport}
                                        rowKey="userId"
                                        loading={loading}
                                        pagination={{ pageSize: 10 }}
                                    />
                                </CustomCard>
                            </>
                        ),
                    },
                ]}
            />

            {/* Modal Cấu hình Lương */}
            <Modal
                title={`Cấu hình lương - ${selectedEmployee?.name}`}
                open={configModalVisible}
                onCancel={() => setConfigModalVisible(false)}
                onOk={() => form.submit()}
                okText="Lưu cấu hình"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleConfigSubmit}>
                    <Form.Item
                        name="hourlyRate"
                        label="Lương theo giờ"
                        rules={[{ type: 'number', min: 0, message: 'Lương không được âm' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ/giờ"
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item
                        name="dailyRate"
                        label="Lương theo ngày (theo ca)"
                        rules={[{ type: 'number', min: 0, message: 'Lương không được âm' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ/ngày"
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item
                        name="monthlyRate"
                        label="Lương cứng (tháng)"
                        rules={[{ type: 'number', min: 0, message: 'Lương không được âm' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ/tháng"
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item
                        name="effectiveFrom"
                        label="Áp dụng từ ngày"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Tính Lương */}
            <Modal
                title="Tính lương nhân viên"
                open={calculateModalVisible}
                onCancel={() => setCalculateModalVisible(false)}
                onOk={() => calculateForm.submit()}
                okText="Tính toán"
                cancelText="Đóng"
                width={700}
            >
                <Form form={calculateForm} layout="vertical" onFinish={handleCalculateSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employeeId"
                                label="Nhân viên"
                                rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                            >
                                <Select
                                    placeholder="Chọn nhân viên"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={employees.map(emp => ({
                                        value: emp.id || emp._id,
                                        label: `${emp.name} (${emp.username})`
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dateRange"
                                label="Kỳ lương"
                                rules={[{ required: true, message: 'Vui lòng chọn kỳ lương' }]}
                            >
                                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                {calculationResult && (
                    <Card
                        title="Kết quả tính toán"
                        size="small"
                        style={{ marginTop: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>Nhân viên:</strong> {calculationResult.employeeName}</p>
                                <p><strong>Tổng giờ làm:</strong> {calculationResult.totalHours?.toFixed(2) || 0} giờ</p>
                                <p><strong>Tổng ngày làm:</strong> {calculationResult.totalDays || 0} ngày</p>
                            </Col>
                            <Col span={12}>
                                <p><strong>Lương theo giờ:</strong> {calculationResult.hourlyPay?.toLocaleString() || 0}đ</p>
                                <p><strong>Lương theo ngày:</strong> {calculationResult.dailyPay?.toLocaleString() || 0}đ</p>
                                <p><strong>Lương cứng:</strong> {calculationResult.monthlyPay?.toLocaleString() || 0}đ</p>
                                <h3 style={{ color: '#cf1322', marginTop: 8 }}>
                                    Tổng thực nhận: {calculationResult.totalSalary?.toLocaleString() || 0}đ
                                </h3>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Modal>
        </div>
    );
};

export default SalaryManagement;

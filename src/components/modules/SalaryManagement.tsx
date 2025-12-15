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
    Input,
    Popconfirm,
    Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    DollarOutlined,
    UserOutlined,
    CalculatorOutlined,
    HistoryOutlined,
    EditOutlined,
    BankOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    ReloadOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { salaryService, userService, SalaryConfig, SalaryCalculation } from '../../api';
import CustomCard from '../common/Card';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const SalaryManagement: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [salaryConfigs, setSalaryConfigs] = useState<Record<string, SalaryConfig>>({});
    const [loading, setLoading] = useState(false);
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [calculateModalVisible, setCalculateModalVisible] = useState(false);
    const [finalizeModalVisible, setFinalizeModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [calculationResult, setCalculationResult] = useState<SalaryCalculation | null>(null);
    const [monthlyReport, setMonthlyReport] = useState<SalaryCalculation[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [form] = Form.useForm();
    const [calculateForm] = Form.useForm();
    const [finalizeForm] = Form.useForm();

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
            message.error('Không thể tải báo cáo lương');
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
                baseSalary: config.baseSalary,
                hourlyRate: config.hourlyRate,
                dailyRate: config.dailyRate,
                allowance: config.allowance,
                deductions: config.deductions,
            });
        }
        setConfigModalVisible(true);
    };

    const handleConfigSubmit = async (values: any) => {
        try {
            await salaryService.updateConfig(selectedEmployee.id || selectedEmployee._id, values);
            message.success('Cập nhật cấu hình lương thành công!');
            setConfigModalVisible(false);
            fetchSalaryConfigs();
            fetchMonthlyReport();
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

    const handleFinalize = (record: SalaryCalculation) => {
        if (record.isPaid) {
            message.warning('Lương tháng này đã được chốt');
            return;
        }
        setSelectedEmployee(record);
        finalizeForm.setFieldsValue({
            employeeId: record.userId,
            month: record.month,
            year: record.year,
            bonus: 0,
            deductions: 0,
        });
        setFinalizeModalVisible(true);
    };

    const handleFinalizeSubmit = async (values: any) => {
        try {
            await salaryService.finalizeSalary(values);
            message.success('Chốt lương thành công!');
            setFinalizeModalVisible(false);
            fetchMonthlyReport();
        } catch (error: any) {
            console.error('Error finalizing salary:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi chốt lương');
        }
    };

    const handleMarkAsPaid = async (salaryLogId: string) => {
        try {
            await salaryService.markAsPaid(salaryLogId);
            message.success('Đã đánh dấu thanh toán!');
            fetchMonthlyReport();
        } catch (error) {
            console.error('Error marking as paid:', error);
            message.error('Có lỗi xảy ra');
        }
    };

    const exportToExcel = () => {
        try {
            import('xlsx').then((XLSX) => {
                if (monthlyReport.length === 0) {
                    message.warning('Không có dữ liệu để xuất!');
                    return;
                }

                const excelData = monthlyReport.map((item, index) => ({
                    'STT': index + 1,
                    'Tên nhân viên': item.employeeName,
                    'Vai trò': item.role,
                    'Tổng giờ': item.totalHours,
                    'Tổng ngày': item.totalDays,
                    'Lương cơ bản': item.baseSalary,
                    'Lương theo giờ': item.hourlyPay,
                    'Lương theo ngày': item.dailyPay,
                    'Phụ cấp': item.allowance,
                    'Khấu trừ': item.deductions,
                    'Tổng lương': item.totalSalary,
                    'Trạng thái': item.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
                }));

                const ws = XLSX.utils.json_to_sheet(excelData);
                ws['!cols'] = [
                    { wch: 5 },
                    { wch: 25 },
                    { wch: 15 },
                    { wch: 12 },
                    { wch: 12 },
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 12 },
                    { wch: 12 },
                    { wch: 15 },
                    { wch: 18 },
                ];

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Bảng lương');

                const filename = `Bang_luong_${selectedMonth.format('MM_YYYY')}.xlsx`;
                XLSX.writeFile(wb, filename);
                message.success('Đã xuất báo cáo Excel thành công!');
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            message.error('Có lỗi khi xuất báo cáo Excel');
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
            title: 'Lương cơ bản',
            key: 'baseSalary',
            render: (_, record) => {
                const config = salaryConfigs[record.id || record._id];
                return config?.baseSalary ? `${config.baseSalary.toLocaleString()}đ` : '-';
            },
        },
        {
            title: 'Lương theo giờ',
            key: 'hourlyRate',
            render: (_, record) => {
                const config = salaryConfigs[record.id || record._id];
                return config?.hourlyRate ? `${config.hourlyRate.toLocaleString()}đ/h` : '-';
            },
        },
        {
            title: 'Lương theo ngày',
            key: 'dailyRate',
            render: (_, record) => {
                const config = salaryConfigs[record.id || record._id];
                return config?.dailyRate ? `${config.dailyRate.toLocaleString()}đ/ngày` : '-';
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
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{record.username}</div>
                </div>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="blue">{role}</Tag>,
        },
        {
            title: 'Giờ làm',
            dataIndex: 'totalHours',
            key: 'totalHours',
            render: (hours) => `${hours.toFixed(1)}h`,
        },
        {
            title: 'Ngày làm',
            dataIndex: 'totalDays',
            key: 'totalDays',
            render: (days) => `${days} ngày`,
        },
        {
            title: 'Lương cơ bản',
            dataIndex: 'baseSalary',
            key: 'baseSalary',
            render: (value) => `${value.toLocaleString()}đ`,
        },
        {
            title: 'Lương giờ',
            dataIndex: 'hourlyPay',
            key: 'hourlyPay',
            render: (value) => `${value.toLocaleString()}đ`,
        },
        {
            title: 'Lương ngày',
            dataIndex: 'dailyPay',
            key: 'dailyPay',
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
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => (
                record.isPaid ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Đã thanh toán</Tag>
                ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>Chưa thanh toán</Tag>
                )
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {!record.isPaid && (
                        <Tooltip title="Chốt lương">
                            <Button
                                type="link"
                                icon={<SaveOutlined />}
                                onClick={() => handleFinalize(record)}
                                size="small"
                            >
                                Chốt
                            </Button>
                        </Tooltip>
                    )}
                    {record.isPaid && record.salaryLogId && record.status === 'pending' && (
                        <Popconfirm
                            title="Xác nhận đã thanh toán?"
                            onConfirm={() => handleMarkAsPaid(record.salaryLogId!)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <Button type="link" icon={<CheckCircleOutlined />} size="small">
                                Đã trả
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const totalSalaryPayout = monthlyReport.reduce((sum, item) => sum + item.totalSalary, 0);
    const paidCount = monthlyReport.filter(item => item.isPaid).length;
    const unpaidCount = monthlyReport.length - paidCount;

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
                                    <Space>
                                        <Button icon={<ReloadOutlined />} onClick={fetchEmployees}>
                                            Tải lại
                                        </Button>
                                        <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculate}>
                                            Tính lương nhanh
                                        </Button>
                                    </Space>
                                </div>
                                <Table
                                    columns={employeeColumns}
                                    dataSource={employees}
                                    rowKey={(record) => record.id || record._id}
                                    scroll={{ x: 'max-content' }}
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
                                    <Col span={6}>
                                        <CustomCard>
                                            <Statistic
                                                title="Tổng chi lương"
                                                value={totalSalaryPayout}
                                                precision={0}
                                                valueStyle={{ color: '#cf1322' }}
                                                prefix={<DollarOutlined />}
                                                suffix="đ"
                                            />
                                        </CustomCard>
                                    </Col>
                                    <Col span={6}>
                                        <CustomCard>
                                            <Statistic
                                                title="Đã thanh toán"
                                                value={paidCount}
                                                valueStyle={{ color: '#3f8600' }}
                                                prefix={<CheckCircleOutlined />}
                                                suffix={`/ ${monthlyReport.length}`}
                                            />
                                        </CustomCard>
                                    </Col>
                                    <Col span={6}>
                                        <CustomCard>
                                            <Statistic
                                                title="Chưa thanh toán"
                                                value={unpaidCount}
                                                valueStyle={{ color: '#faad14' }}
                                                prefix={<CloseCircleOutlined />}
                                            />
                                        </CustomCard>
                                    </Col>
                                    <Col span={6}>
                                        <CustomCard>
                                            <div style={{ marginBottom: 8 }}>Chọn tháng</div>
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
                                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                                            Bảng lương tháng {selectedMonth.format('MM/YYYY')}
                                        </h2>
                                        <Space>
                                            <Button icon={<ReloadOutlined />} onClick={fetchMonthlyReport} loading={loading}>
                                                Tải lại
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<DownloadOutlined />}
                                                onClick={exportToExcel}
                                                disabled={monthlyReport.length === 0}
                                            >
                                                Xuất Excel
                                            </Button>
                                        </Space>
                                    </div>
                                    <Table
                                        columns={reportColumns}
                                        dataSource={monthlyReport}
                                        rowKey="userId"
                                        loading={loading}
                                        scroll={{ x: 'max-content' }}
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
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleConfigSubmit}>
                    <Form.Item
                        name="baseSalary"
                        label="Lương cơ bản (tháng)"
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
                        label="Lương theo ngày"
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
                        name="allowance"
                        label="Phụ cấp"
                        rules={[{ type: 'number', min: 0, message: 'Phụ cấp không được âm' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ"
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item
                        name="deductions"
                        label="Khấu trừ"
                        rules={[{ type: 'number', min: 0, message: 'Khấu trừ không được âm' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ"
                            placeholder="0"
                        />
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
                                <p><strong>Số ca làm:</strong> {calculationResult.shiftsCount || 0} ca</p>
                            </Col>
                            <Col span={12}>
                                <p><strong>Lương cơ bản:</strong> {calculationResult.baseSalary?.toLocaleString() || 0}đ</p>
                                <p><strong>Lương theo giờ:</strong> {calculationResult.hourlyPay?.toLocaleString() || 0}đ</p>
                                <p><strong>Lương theo ngày:</strong> {calculationResult.dailyPay?.toLocaleString() || 0}đ</p>
                                <h3 style={{ color: '#cf1322', marginTop: 8 }}>
                                    Tổng thực nhận: {calculationResult.totalSalary?.toLocaleString() || 0}đ
                                </h3>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Modal>

            {/* Modal Chốt Lương */}
            <Modal
                title="Chốt lương"
                open={finalizeModalVisible}
                onCancel={() => setFinalizeModalVisible(false)}
                onOk={() => finalizeForm.submit()}
                okText="Chốt lương"
                cancelText="Hủy"
            >
                <Form form={finalizeForm} layout="vertical" onFinish={handleFinalizeSubmit}>
                    <Form.Item name="employeeId" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="month" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="year" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="bonus" label="Thưởng thêm">
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ"
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item name="deductions" label="Khấu trừ thêm">
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="đ"
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} placeholder="Ghi chú về lương tháng này..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalaryManagement;

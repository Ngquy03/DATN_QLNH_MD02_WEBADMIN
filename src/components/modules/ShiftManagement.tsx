import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Tag,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
    DatePicker,
    TimePicker,
    Tabs,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { shiftService, userService, Shift, CreateShiftRequest, ShiftEmployee } from '../../api';
import Card from '../common/Card';

const { TabPane } = Tabs;
const { TextArea } = Input;

const ShiftManagement: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [form] = Form.useForm();

    useEffect(() => {
        fetchShifts();
        fetchEmployees();
    }, [selectedDate]);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const { data } = await shiftService.getAll({ date: selectedDate });
            setShifts(data);
        } catch (error) {
            console.error('Error fetching shifts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const users = await userService.getAll();
            setEmployees(users.filter((u: any) => u.role !== 'admin'));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleCreate = () => {
        setEditingShift(null);
        form.resetFields();
        form.setFieldsValue({ date: dayjs(selectedDate) });
        setModalVisible(true);
    };

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
        form.setFieldsValue({
            ...shift,
            date: dayjs(shift.date),
            startTime: dayjs(shift.startTime, 'HH:mm'),
            endTime: dayjs(shift.endTime, 'HH:mm'),
            employeeIds: shift.employees.map((e) => (typeof e.employeeId === 'string' ? e.employeeId : e.employeeId._id)),
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await shiftService.delete(id);
            message.success('Xóa ca làm việc thành công!');
            fetchShifts();
        } catch (error) {
            console.error('Error deleting shift:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const shiftData: CreateShiftRequest = {
                name: values.name,
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
                date: values.date.format('YYYY-MM-DD'),
                employees: values.employeeIds?.map((id: string) => ({
                    employeeId: id,
                    status: 'scheduled' as const,
                })),
                notes: values.notes,
            };

            if (editingShift) {
                const updateData: any = {
                    ...shiftData,
                    employees: shiftData.employees?.map((e) => ({
                        ...e,
                        status: 'scheduled' as const,
                    })),
                };
                await shiftService.update(editingShift._id, updateData);
                message.success('Cập nhật ca làm việc thành công!');
            } else {
                await shiftService.create(shiftData);
                message.success('Tạo ca làm việc thành công!');
            }

            setModalVisible(false);
            form.resetFields();
            fetchShifts();
        } catch (error) {
            console.error('Error saving shift:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'success';
            case 'late':
                return 'warning';
            case 'absent':
                return 'error';
            case 'scheduled':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'present':
                return 'Có mặt';
            case 'late':
                return 'Đi muộn';
            case 'absent':
                return 'Vắng';
            case 'scheduled':
                return 'Đã lên lịch';
            default:
                return status;
        }
    };

    const getShiftStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'processing';
            case 'scheduled':
                return 'default';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getShiftStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'in_progress':
                return 'Đang diễn ra';
            case 'scheduled':
                return 'Đã lên lịch';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const columns: ColumnsType<Shift> = [
        {
            title: 'Tên ca',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => (
                <Tag icon={<ClockCircleOutlined />} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {name}
                </Tag>
            ),
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record: Shift) => (
                <span>
                    {record.startTime} - {record.endTime}
                </span>
            ),
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Nhân viên',
            dataIndex: 'employees',
            key: 'employees',
            render: (employees: ShiftEmployee[]) => (
                <Space>
                    <UserOutlined />
                    <span>{employees.length} người</span>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={getShiftStatusColor(status)}>{getShiftStatusText(status)}</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record: Shift) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa ca làm việc?"
                        description="Bạn có chắc chắn muốn xóa ca làm việc này?"
                        onConfirm={() => handleDelete(record._id)}
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

    const expandedRowRender = (record: Shift) => {
        const employeeColumns: ColumnsType<ShiftEmployee> = [
            {
                title: 'Nhân viên',
                key: 'employee',
                render: (_, emp: ShiftEmployee) => {
                    const employee = typeof emp.employeeId === 'string' ? null : emp.employeeId;
                    return employee ? `${employee.name} (${employee.username})` : 'N/A';
                },
            },
            {
                title: 'Vai trò',
                key: 'role',
                render: (_, emp: ShiftEmployee) => {
                    const employee = typeof emp.employeeId === 'string' ? null : emp.employeeId;
                    return employee?.role || 'N/A';
                },
            },
            {
                title: 'Giờ vào',
                dataIndex: 'checkinTime',
                key: 'checkinTime',
                render: (time: string) => (time ? dayjs(time).format('HH:mm:ss') : '-'),
            },
            {
                title: 'Giờ ra',
                dataIndex: 'checkoutTime',
                key: 'checkoutTime',
                render: (time: string) => (time ? dayjs(time).format('HH:mm:ss') : '-'),
            },
            {
                title: 'Số giờ',
                dataIndex: 'actualHours',
                key: 'actualHours',
                render: (hours: number) => (hours ? `${hours.toFixed(2)}h` : '-'),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
            },
        ];

        return <Table columns={employeeColumns} dataSource={record.employees} pagination={false} scroll={{ x: 'max-content' }} rowKey={(emp) => (typeof emp.employeeId === 'string' ? emp.employeeId : emp.employeeId._id)} />;
    };

    const totalEmployees = shifts.reduce((sum, shift) => sum + shift.employees.length, 0);
    const completedShifts = shifts.filter((s) => s.status === 'completed').length;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Quản lý Ca làm việc</h1>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>Quản lý ca làm việc và chấm công nhân viên</p>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng số ca" value={shifts.length} prefix={<ClockCircleOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Ca hoàn thành" value={completedShifts} valueStyle={{ color: '#3f8600' }} prefix={<CheckOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng nhân viên" value={totalEmployees} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <DatePicker
                            value={dayjs(selectedDate)}
                            onChange={(date) => {
                                if (date) {
                                    setSelectedDate(date.format('YYYY-MM-DD'));
                                }
                            }}
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Danh sách Ca làm việc</h2>
                    <div style={{ display: 'flex', gap: 8 }}    >
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchShifts} // hoặc reload function
                            loading={loading}
                        >
                            Tải lại
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Tạo ca mới
                        </Button>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={shifts}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    expandable={{ expandedRowRender }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingShift ? 'Chỉnh sửa Ca làm việc' : 'Tạo Ca làm việc mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={700}
                okText={editingShift ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="Tên ca" rules={[{ required: true, message: 'Vui lòng nhập tên ca!' }]}>
                        <Input placeholder="VD: Ca sáng" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}>
                                <TimePicker style={{ width: '100%' }} format="HH:mm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endTime" label="Giờ kết thúc" rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}>
                                <TimePicker style={{ width: '100%' }} format="HH:mm" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item name="employeeIds" label="Nhân viên">
                        <Select mode="multiple" placeholder="Chọn nhân viên" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>
                            {employees.map((emp) => (
                                <Option key={emp._id} value={emp._id} label={emp.name}>
                                    {emp.name} ({emp.username}) - {emp.role}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="notes" label="Ghi chú">
                        <TextArea rows={3} placeholder="Ghi chú về ca làm việc..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ShiftManagement;

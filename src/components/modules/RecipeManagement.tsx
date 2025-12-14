import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    message,
    Tag,
    Popconfirm,
    Row,
    Col,
    Divider,
    Typography,
    Steps,
    Upload,
    Tooltip,
    Badge,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    UploadOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';
import { recipeService, menuService, ingredientService } from '../../api';
import type {
    Recipe,
    CreateRecipeRequest,
    UpdateRecipeRequest,
    RecipeIngredient,
    RecipeInstruction,
} from '../../api/recipe.service';
import type { MenuItem } from '../../api/menu.service';
import type { Ingredient } from '../../api/ingredient.service';
import { useDataFetch } from '../../hooks/useDataFetch';

const { Title, Text } = Typography;
const { TextArea } = Input;

const RecipeManagement: React.FC = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [checkingIngredients, setCheckingIngredients] = useState(false);
    const [ingredientCheckResult, setIngredientCheckResult] = useState<any>(null);

    const { data: recipes, loading, error, reload, fetchData } = useDataFetch<Recipe[]>(
        recipeService.getAll
    );

    useEffect(() => {
        fetchData();
        loadMenuItems();
        loadIngredients();
    }, []);

    const loadMenuItems = async () => {
        try {
            const data = await menuService.getAll();
            setMenuItems(data);
        } catch (error) {
            message.error('Không thể tải danh sách món ăn');
        }
    };

    const loadIngredients = async () => {
        try {
            const data = await ingredientService.getAll();
            setIngredients(data);
        } catch (error) {
            message.error('Không thể tải danh sách nguyên liệu');
        }
    };

    const showModal = (recipe?: Recipe) => {
        if (recipe) {
            setEditingRecipe(recipe);
            form.setFieldsValue({
                ...recipe,
                tips: recipe.tips?.join('\n') || '',
                tags: recipe.tags?.join(', ') || '',
            });
        } else {
            setEditingRecipe(null);
            form.resetFields();
        }
        setIsModalVisible(true);
        setIngredientCheckResult(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecipe(null);
        form.resetFields();
        setIngredientCheckResult(null);
    };

    const handleSubmit = async (values: any) => {
        try {
            const recipeData: CreateRecipeRequest | UpdateRecipeRequest = {
                ...values,
                tips: values.tips ? values.tips.split('\n').filter((t: string) => t.trim()) : [],
                tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
            };

            if (editingRecipe) {
                await recipeService.update(editingRecipe.id, recipeData);
                message.success('Cập nhật công thức thành công');
            } else {
                await recipeService.create(recipeData as CreateRecipeRequest);
                message.success('Tạo công thức thành công');
            }

            handleCancel();
            reload();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await recipeService.delete(id);
            message.success('Xóa công thức thành công');
            reload();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const checkIngredientAvailability = async (recipeId: string) => {
        try {
            setCheckingIngredients(true);
            const result = await recipeService.checkIngredients(recipeId);
            setIngredientCheckResult(result);

            Modal.info({
                title: 'Kiểm tra nguyên liệu',
                width: 700,
                content: (
                    <div>
                        <p>
                            <strong>Món ăn:</strong> {result.recipeName}
                        </p>
                        <p>
                            <strong>Số phần:</strong> {result.servings}
                        </p>
                        <p>
                            <strong>Trạng thái:</strong>{' '}
                            {result.allAvailable ? (
                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                    Đủ nguyên liệu
                                </Tag>
                            ) : (
                                <Tag color="error" icon={<ExclamationCircleOutlined />}>
                                    Thiếu nguyên liệu
                                </Tag>
                            )}
                        </p>
                        <Divider />
                        <Table
                            dataSource={result.ingredients}
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Nguyên liệu',
                                    dataIndex: 'ingredientName',
                                    key: 'ingredientName',
                                },
                                {
                                    title: 'Cần',
                                    dataIndex: 'required',
                                    key: 'required',
                                    render: (val, record) => `${val} ${record.unit}`,
                                },
                                {
                                    title: 'Có',
                                    dataIndex: 'available',
                                    key: 'available',
                                    render: (val, record) => `${val} ${record.unit}`,
                                },
                                {
                                    title: 'Trạng thái',
                                    dataIndex: 'isAvailable',
                                    key: 'isAvailable',
                                    render: (val) =>
                                        val ? (
                                            <Tag color="success">Đủ</Tag>
                                        ) : (
                                            <Tag color="error">Thiếu</Tag>
                                        ),
                                },
                            ]}
                        />
                    </div>
                ),
            });
        } catch (error: any) {
            message.error('Không thể kiểm tra nguyên liệu');
        } finally {
            setCheckingIngredients(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'success';
            case 'medium':
                return 'warning';
            case 'hard':
                return 'error';
            default:
                return 'default';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'Dễ';
            case 'medium':
                return 'Trung bình';
            case 'hard':
                return 'Khó';
            default:
                return difficulty;
        }
    };

    const columns = [
        {
            title: 'Món ăn',
            dataIndex: 'menuItemName',
            key: 'menuItemName',
            width: 200,
            render: (text: string, record: Recipe) => (
                <Space>
                    {record.image && (
                        <img
                            src={record.image}
                            alt={text}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                        />
                    )}
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (text: string) => <Tag color="blue">{text || 'Chưa phân loại'}</Tag>,
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: 120,
            render: (text: string) => (
                <Tag color={getDifficultyColor(text)}>{getDifficultyText(text)}</Tag>
            ),
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 150,
            render: (_: any, record: Recipe) => (
                <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> Chuẩn bị: {record.preparationTime || 0} phút
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> Nấu: {record.cookingTime || 0} phút
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Số phần',
            dataIndex: 'servings',
            key: 'servings',
            width: 100,
            align: 'center' as const,
        },
        {
            title: 'Nguyên liệu',
            dataIndex: 'ingredients',
            key: 'ingredients',
            width: 120,
            align: 'center' as const,
            render: (ingredients: RecipeIngredient[]) => (
                <Badge count={ingredients?.length || 0} showZero color="blue" />
            ),
        },
        {
            title: 'Bước',
            dataIndex: 'instructions',
            key: 'instructions',
            width: 100,
            align: 'center' as const,
            render: (instructions: RecipeInstruction[]) => (
                <Badge count={instructions?.length || 0} showZero color="green" />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const statusConfig: Record<string, { color: string; text: string }> = {
                    active: { color: 'success', text: 'Hoạt động' },
                    inactive: { color: 'default', text: 'Không hoạt động' },
                    draft: { color: 'warning', text: 'Bản nháp' },
                };
                const config = statusConfig[status] || statusConfig.draft;
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: Recipe) => (
                <Space>
                    <Tooltip title="Kiểm tra nguyên liệu">
                        <Button
                            type="link"
                            icon={<CheckCircleOutlined />}
                            onClick={() => checkIngredientAvailability(record.id)}
                            loading={checkingIngredients}
                        />
                    </Tooltip>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa công thức này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            Quản lý Công thức Món ăn
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={reload}>
                                Tải lại
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                            >
                                Thêm công thức
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={recipes}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1400 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} công thức`,
                    }}
                />
            </Card>

            <Modal
                title={editingRecipe ? 'Sửa công thức' : 'Thêm công thức mới'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={900}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        servings: 1,
                        difficulty: 'medium',
                        status: 'active',
                        preparationTime: 0,
                        cookingTime: 0,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="menuItemId"
                                label="Món ăn"
                                rules={[{ required: true, message: 'Vui lòng chọn món ăn' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn món ăn"
                                    optionFilterProp="children"
                                    onChange={(value) => {
                                        const item = menuItems.find((m) => m.id === value);
                                        if (item) {
                                            form.setFieldsValue({
                                                menuItemName: item.name,
                                                category: item.category,
                                                image: item.image,
                                            });
                                        }
                                    }}
                                >
                                    {menuItems.map((item) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="menuItemName" label="Tên món ăn">
                                <Input placeholder="Tên món ăn" disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="preparationTime" label="Thời gian chuẩn bị (phút)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="cookingTime" label="Thời gian nấu (phút)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="servings" label="Số phần ăn">
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="difficulty" label="Độ khó">
                                <Select>
                                    <Select.Option value="easy">Dễ</Select.Option>
                                    <Select.Option value="medium">Trung bình</Select.Option>
                                    <Select.Option value="hard">Khó</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="category" label="Danh mục">
                                <Input placeholder="Danh mục" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select>
                                    <Select.Option value="active">Hoạt động</Select.Option>
                                    <Select.Option value="inactive">Không hoạt động</Select.Option>
                                    <Select.Option value="draft">Bản nháp</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Nguyên liệu</Divider>

                    <Form.List name="ingredients">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={8} align="middle">
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'ingredientId']}
                                                rules={[{ required: true, message: 'Chọn nguyên liệu' }]}
                                            >
                                                <Select
                                                    showSearch
                                                    placeholder="Chọn nguyên liệu"
                                                    optionFilterProp="children"
                                                    onChange={(value) => {
                                                        const ing = ingredients.find((i) => i.id === value);
                                                        if (ing) {
                                                            const currentIngredients = form.getFieldValue('ingredients');
                                                            currentIngredients[name] = {
                                                                ...currentIngredients[name],
                                                                ingredientName: ing.name,
                                                                unit: ing.unit,
                                                            };
                                                            form.setFieldsValue({ ingredients: currentIngredients });
                                                        }
                                                    }}
                                                >
                                                    {ingredients.map((ing) => (
                                                        <Select.Option key={ing.id} value={ing.id}>
                                                            {ing.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                rules={[{ required: true, message: 'Nhập số lượng' }]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    placeholder="Số lượng"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}>
                                            <Form.Item {...restField} name={[name, 'unit']}>
                                                <Input placeholder="Đơn vị" disabled />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Col>
                                        <Form.Item {...restField} name={[name, 'ingredientName']} hidden>
                                            <Input />
                                        </Form.Item>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm nguyên liệu
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Divider>Hướng dẫn chế biến</Divider>

                    <Form.List name="instructions">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                                        <Row gutter={8}>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'step']}
                                                    label="Bước"
                                                    rules={[{ required: true, message: 'Nhập số bước' }]}
                                                >
                                                    <InputNumber min={1} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item {...restField} name={[name, 'duration']} label="Thời gian (phút)">
                                                    <InputNumber min={0} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={14}>
                                                <Form.Item {...restField} name={[name, 'image']} label="Hình ảnh (URL)">
                                                    <Input placeholder="URL hình ảnh" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'description']}
                                            label="Mô tả"
                                            rules={[{ required: true, message: 'Nhập mô tả' }]}
                                        >
                                            <TextArea rows={2} placeholder="Mô tả chi tiết bước này" />
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm bước
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Divider />

                    <Form.Item name="notes" label="Ghi chú">
                        <TextArea rows={3} placeholder="Ghi chú chung về công thức" />
                    </Form.Item>

                    <Form.Item name="tips" label="Mẹo (mỗi dòng một mẹo)">
                        <TextArea rows={3} placeholder="Mẹo 1&#10;Mẹo 2&#10;Mẹo 3" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="tags" label="Tags (phân cách bằng dấu phẩy)">
                                <Input placeholder="ví dụ: món chính, món Việt, dễ làm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="image" label="Hình ảnh (URL)">
                                <Input placeholder="URL hình ảnh" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="video" label="Video hướng dẫn (URL)">
                        <Input placeholder="URL video" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingRecipe ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RecipeManagement;

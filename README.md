# 🍽️ Restaurant Management System - Admin Dashboard

Hệ thống quản lý nhà hàng với giao diện admin hiện đại, được xây dựng bằng React, TypeScript và Ant Design.

## ✨ Tính năng

- 🔐 **Xác thực người dùng** - Đăng nhập/đăng xuất an toàn
- 📊 **Dashboard thống kê** - Tổng quan về hoạt động nhà hàng
- 👥 **Quản lý nhân viên** - CRUD operations cho nhân viên
- 🍔 **Quản lý thực đơn** - Quản lý món ăn, giá cả, danh mục
- 📦 **Quản lý kho hàng** - Theo dõi nguyên liệu, cảnh báo tồn kho
- ⚙️ **Cài đặt hệ thống** - Cấu hình thông tin nhà hàng

## 🏗️ Cấu trúc dự án

```
src/
├── api/                    # API services và axios instance
│   ├── axios.ts           # Axios instance với interceptors
│   ├── auth.service.ts    # Authentication APIs
│   ├── user.service.ts    # User management APIs
│   ├── menu.service.ts    # Menu management APIs
│   ├── ingredient.service.ts # Ingredient management APIs
│   └── index.ts           # Barrel exports
├── components/
│   ├── common/            # Reusable components
│   │   ├── Card.tsx
│   │   ├── PageLoader.tsx
│   │   └── index.ts
│   ├── layout/            # Layout components
│   │   └── MainLayout.tsx
│   └── modules/           # Feature modules
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── UserManagement.tsx
│       ├── MenuManagement.tsx
│       ├── IngredientManagement.tsx
│       └── Settings.tsx
├── hooks/                 # Custom React hooks
│   └── useApi.ts
├── styles/                # Global styles
│   └── index.css
├── App.tsx               # Main App component
├── index.tsx             # Entry point
└── vite-env.d.ts         # TypeScript definitions

```

## 🚀 Cài đặt và chạy

### Yêu cầu

- Node.js >= 16
- npm hoặc yarn

### Cài đặt dependencies

```bash
npm install
```

### Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3001`

### Build production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🎨 Công nghệ sử dụng

- **React 19** - UI library
- **TypeScript** - Type safety
- **Ant Design** - UI component library
- **Axios** - HTTP client
- **Vite** - Build tool
- **React Icons** - Icon library (@ant-design/icons)

## 📦 API Instance

Dự án sử dụng một axios instance tập trung với các tính năng:

- ✅ Tự động thêm Authorization header
- ✅ Xử lý lỗi tập trung
- ✅ Request/Response interceptors
- ✅ Timeout configuration
- ✅ Base URL configuration

### Sử dụng API services

```typescript
import { userService, menuService, ingredientService } from '@/api';

// Lấy danh sách users
const users = await userService.getAll();

// Tạo user mới
const newUser = await userService.create({
  username: 'john',
  password: '123456',
  role: 'staff',
  fullName: 'John Doe'
});

// Cập nhật user
await userService.update(userId, { role: 'manager' });

// Xóa user
await userService.delete(userId);
```

## 🎯 Custom Hooks

### useApi Hook

Hook để xử lý API calls với loading state và error handling:

```typescript
import { useApi } from '@/hooks/useApi';
import { userService } from '@/api';

const { loading, data, execute } = useApi(
  userService.getAll,
  {
    successMessage: 'Tải dữ liệu thành công!',
    onSuccess: (data) => console.log(data),
  }
);

// Execute API call
await execute();
```

## 🔧 Components tái sử dụng

### Card Component

```typescript
import { Card } from '@/components/common';

<Card title="Tiêu đề">
  Nội dung
</Card>
```

### PageLoader Component

```typescript
import { PageLoader } from '@/components/common';

<PageLoader tip="Đang tải dữ liệu..." />
```

## 🎨 Thiết kế

- **Modern UI** - Giao diện hiện đại với Ant Design
- **Responsive** - Tương thích mọi kích thước màn hình
- **Dark Mode Ready** - Sẵn sàng cho chế độ tối
- **Consistent** - Thiết kế nhất quán trên toàn bộ ứng dụng
- **Accessible** - Tuân thủ các tiêu chuẩn accessibility

## 📝 License

MIT

## 👨‍💻 Tác giả

Restaurant Management System Team

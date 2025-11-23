
export interface User {
  _id: string;
  username: string;
  password?: string; // Only for creation
  role: 'admin' | 'staff' | 'customer';
  name: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewUser = Pick<User, 'username' | 'password' | 'role' | 'name' | 'phoneNumber' | 'email'>;
export type UpdateUser = Pick<User,'username'| 'name' | 'phoneNumber' | 'email' | 'isActive' | 'role'>;

export interface Report {
  _id: string;
  reportType: string;
  date: string;
  timeFrame: string;
  totalRevenue: number;
  totalOrders: number;
  totalDiscountGiven: number;
  averageOrderValue: number;
  details: {
    startDate: string;
    endDate: string;
    orders: any[];
  };
  generatedAt: string;
}


export interface Ingredient {
    _id: string;
    name: string;
    unit: string;
    quantity: number;
    minThreshold: number;
    importPrice: number;
    supplier?: string;
    status: 'available' | 'low_stock' | 'out_of_stock';
    createdAt?: string;
    updatedAt?: string;
}

export interface RecipeItem {
    ingredient: Ingredient | string; // Khi populate là object, khi lưu là ID string
    quantityNeeded: number;
    _id?: string;
}

export interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    category: string;
    isAvailable: boolean;
    recipe: RecipeItem[];
    createdAt?: string;
}
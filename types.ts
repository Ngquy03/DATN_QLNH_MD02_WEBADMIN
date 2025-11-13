
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
export type UpdateUser = Pick<User, 'name' | 'phoneNumber' | 'isActive'>;

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

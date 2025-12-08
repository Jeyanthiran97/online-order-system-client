export type UserRole = "customer" | "seller" | "deliverer" | "admin";

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    status?: "pending" | "approved" | "rejected";
    shopName?: string;
    fullName?: string;
    [key: string]: any;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCustomerData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
}




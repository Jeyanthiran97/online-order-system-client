import api from "@/lib/api";

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

export interface RegisterSellerData {
  email: string;
  password: string;
  shopName: string;
  documents?: string[];
}

export interface RegisterDelivererData {
  email: string;
  password: string;
  fullName: string;
  licenseNumber: string;
  NIC: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  registerCustomer: async (data: RegisterCustomerData) => {
    const response = await api.post("/auth/register/customer", data);
    return response.data;
  },

  registerSeller: async (data: RegisterSellerData) => {
    const response = await api.post("/auth/register/seller", data);
    return response.data;
  },

  registerDeliverer: async (data: RegisterDelivererData) => {
    const response = await api.post("/auth/register/deliverer", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch("/auth/me", data);
    return response.data;
  },
};





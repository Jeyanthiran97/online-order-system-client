import api from "@/lib/api";
import { LoginCredentials, RegisterCustomerData } from "@/types/user";
import { RegisterSellerData } from "@/types/seller";
import { RegisterDelivererData } from "@/types/deliverer";

export type { LoginCredentials, RegisterCustomerData, RegisterSellerData, RegisterDelivererData };

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





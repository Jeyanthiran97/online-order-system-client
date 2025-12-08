import apiClient from "@/lib/apiClient";
import { LoginCredentials, RegisterCustomerData } from "@/types/user";
import { RegisterSellerData } from "@/types/seller";
import { RegisterDelivererData } from "@/types/deliverer";

export type {
  LoginCredentials,
  RegisterCustomerData,
  RegisterSellerData,
  RegisterDelivererData,
};

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  registerCustomer: async (data: RegisterCustomerData) => {
    const response = await apiClient.post("/auth/register/customer", data);
    return response.data;
  },

  registerSeller: async (data: RegisterSellerData) => {
    const response = await apiClient.post("/auth/register/seller", data);
    return response.data;
  },

  registerDeliverer: async (data: RegisterDelivererData) => {
    const response = await apiClient.post("/auth/register/deliverer", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch("/auth/me", data);
    return response.data;
  },
};



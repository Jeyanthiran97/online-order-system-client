import apiClient from "@/lib/apiClient";
import { User } from "@/types/user";
import { Seller } from "@/types/seller";
import { Deliverer } from "@/types/deliverer";
import { Analytics } from "@/types/analytics";

export type { User, Seller, Deliverer, Analytics };

export const userService = {
  // User management
  getUsers: async (filters?: {
    role?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/users", { params: filters });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Seller management
  getSellers: async (filters?: {
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/sellers", { params: filters });
    return response.data;
  },

  getSeller: async (id: string) => {
    const response = await apiClient.get(`/sellers/${id}`);
    return response.data;
  },

  approveSeller: async (id: string) => {
    const response = await apiClient.patch(`/sellers/${id}/approve`);
    return response.data;
  },

  rejectSeller: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/sellers/${id}/reject`, { reason });
    return response.data;
  },

  // Deliverer management
  getDeliverers: async (filters?: {
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/deliverers", { params: filters });
    return response.data;
  },

  getDeliverer: async (id: string) => {
    const response = await apiClient.get(`/deliverers/${id}`);
    return response.data;
  },

  approveDeliverer: async (id: string) => {
    const response = await apiClient.patch(`/deliverers/${id}/approve`);
    return response.data;
  },

  rejectDeliverer: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/deliverers/${id}/reject`, { reason });
    return response.data;
  },

  // Customer management
  getCustomers: async (filters?: {
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/customers", { params: filters });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await apiClient.get("/analytics");
    return response.data;
  },

  // Address management
  addAddress: async (address: any) => {
    const response = await apiClient.post("/users/address", address);
    return response.data;
  },

  getAddresses: async () => {
    const response = await apiClient.get("/users/address");
    return response.data;
  },

  updateAddress: async (id: string, address: any) => {
    const response = await apiClient.put(`/users/address/${id}`, address);
    return response.data;
  },

  deleteAddress: async (id: string) => {
    const response = await apiClient.delete(`/users/address/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id: string) => {
    const response = await apiClient.patch(`/users/address/${id}/default`);
    return response.data;
  },
};




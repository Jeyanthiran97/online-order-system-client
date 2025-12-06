import api from "@/lib/api";
import { User } from "@/types/user";
import { Seller } from "@/types/seller";
import { Deliverer } from "@/types/deliverer";
import { Analytics } from "@/types/analytics";

export type { User, Seller, Deliverer, Analytics };

export const adminService = {
  getUsers: async (filters?: { role?: string; sort?: string; page?: number; limit?: number }) => {
    const response = await api.get("/users", { params: filters });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getSellers: async (filters?: { status?: string; sort?: string; page?: number; limit?: number }) => {
    const response = await api.get("/sellers", { params: filters });
    return response.data;
  },

  getSeller: async (id: string) => {
    const response = await api.get(`/sellers/${id}`);
    return response.data;
  },

  approveSeller: async (id: string) => {
    const response = await api.patch(`/sellers/${id}/approve`);
    return response.data;
  },

  rejectSeller: async (id: string, reason: string) => {
    const response = await api.patch(`/sellers/${id}/reject`, { reason });
    return response.data;
  },

  getDeliverers: async (filters?: { status?: string; sort?: string; page?: number; limit?: number }) => {
    const response = await api.get("/deliverers", { params: filters });
    return response.data;
  },

  getDeliverer: async (id: string) => {
    const response = await api.get(`/deliverers/${id}`);
    return response.data;
  },

  approveDeliverer: async (id: string) => {
    const response = await api.patch(`/deliverers/${id}/approve`);
    return response.data;
  },

  rejectDeliverer: async (id: string, reason: string) => {
    const response = await api.patch(`/deliverers/${id}/reject`, { reason });
    return response.data;
  },

  getCustomers: async (filters?: { sort?: string; page?: number; limit?: number }) => {
    const response = await api.get("/customers", { params: filters });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get("/analytics");
    return response.data;
  },
};





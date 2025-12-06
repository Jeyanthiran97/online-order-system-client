import api from "@/lib/api";
import { Order, OrderItem, OrderFilters, CreateOrderData } from "@/types/order";

export type { Order, OrderItem, OrderFilters, CreateOrderData };

export const orderService = {
  getOrders: async (filters?: OrderFilters) => {
    const response = await api.get("/orders", { params: filters });
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderData) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  updateOrder: async (id: string, data: { status?: string; assignedDelivererId?: string }) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },
};





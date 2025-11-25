import api from "@/lib/api";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customerId: string;
  items: Array<OrderItem & { product?: any }>;
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  delivererId?: string;
  delivery?: {
    _id: string;
    status: string;
    delivererId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: string;
}

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

  updateOrder: async (id: string, data: { status?: string; delivererId?: string }) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },
};





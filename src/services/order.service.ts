import apiClient from "@/lib/apiClient";
import { Order, OrderItem, OrderFilters, CreateOrderData } from "@/types/order";

export type { Order, OrderItem, OrderFilters, CreateOrderData };

// Transform backend order format to frontend format
const transformOrder = (order: any): Order => {
  return {
    _id: order._id,
    customerId: typeof order.customerId === 'object' ? order.customerId._id : order.customerId,
    items: (order.products || []).map((item: any) => ({
      productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
      quantity: item.quantity,
      price: item.price,
      product: typeof item.productId === 'object' ? item.productId : undefined,
    })),
    totalAmount: order.totalPrice || 0,
    status: order.status,
    shippingAddress: typeof order.customerId === 'object' && order.customerId.address ? order.customerId.address : '',
    delivererId: typeof order.assignedDelivererId === 'object' ? order.assignedDelivererId._id : order.assignedDelivererId,
    delivery: order.delivery,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const orderService = {
  getOrders: async (filters?: OrderFilters) => {
    const response = await apiClient.get("/orders", { params: filters });
    if (response.data.success && response.data.data) {
      return {
        ...response.data,
        data: response.data.data.map(transformOrder),
      };
    }
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    if (response.data.success && response.data.data) {
      return {
        ...response.data,
        data: transformOrder(response.data.data),
      };
    }
    return response.data;
  },

  createOrder: async (data: CreateOrderData) => {
    // Convert frontend format to backend format
    const backendData = {
      products: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: data.paymentMethod || 'dummy',
      fromCart: data.fromCart || false,
    };
    const response = await apiClient.post("/orders", backendData);
    if (response.data.success && response.data.data) {
      return {
        ...response.data,
        data: transformOrder(response.data.data),
      };
    }
    return response.data;
  },

  updateOrder: async (
    id: string,
    data: { status?: string; assignedDelivererId?: string }
  ) => {
    const response = await apiClient.patch(`/orders/${id}`, data);
    if (response.data.success && response.data.data) {
      return {
        ...response.data,
        data: transformOrder(response.data.data),
      };
    }
    return response.data;
  },
};




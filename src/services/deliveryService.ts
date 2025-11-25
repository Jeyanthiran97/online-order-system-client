import api from "@/lib/api";

export interface Delivery {
  _id: string;
  orderId: string;
  delivererId: string;
  status: "pending" | "in-transit" | "delivered";
  deliveryTime?: string;
  order?: any;
  createdAt: string;
  updatedAt: string;
}

export const deliveryService = {
  getDeliveries: async () => {
    const response = await api.get("/deliveries");
    return response.data;
  },

  getDelivery: async (id: string) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  updateDeliveryStatus: async (id: string, status: "pending" | "in-transit" | "delivered") => {
    const response = await api.patch(`/deliveries/${id}`, { status });
    return response.data;
  },
};


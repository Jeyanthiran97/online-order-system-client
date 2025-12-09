import apiClient from "@/lib/apiClient";
import { Delivery } from "@/types/delivery";

export type { Delivery };

export const deliveryService = {
  getDeliveries: async () => {
    const response = await apiClient.get("/deliveries");
    return response.data;
  },

  getDelivery: async (id: string) => {
    const response = await apiClient.get(`/deliveries/${id}`);
    return response.data;
  },

  updateDeliveryStatus: async (
    id: string,
    status: "pending" | "in-transit" | "delivered"
  ) => {
    const response = await apiClient.patch(`/deliveries/${id}`, { status });
    return response.data;
  },
};




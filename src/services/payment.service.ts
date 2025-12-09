import api from "@/lib/apiClient";

export const paymentService = {
  async createCheckoutSession(items: { productId: string; quantity: number }[]) {
    const response = await api.post("/payments/create-checkout-session", { items });
    return response.data;
  },
};

import api from "@/lib/apiClient";

export const paymentService = {
  async createCheckoutSession(items: { productId: string; quantity: number }[], shippingAddress: any) {
    const response = await api.post("/payments/create-checkout-session", { items, shippingAddress });
    return response.data;
  },

  async verifySession(sessionId: string) {
    const response = await api.post("/payments/verify-session", { sessionId });
    return response.data;
  },
};

import apiClient from "@/lib/apiClient";
import { Cart, AddToCartData, UpdateCartItemData } from "@/types/cart";

export type { Cart, AddToCartData, UpdateCartItemData };

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get("/cart");
    return response.data;
  },

  addToCart: async (data: AddToCartData) => {
    const response = await apiClient.post("/cart/items", data);
    return response.data;
  },

  updateCartItem: async (productId: string, data: UpdateCartItemData) => {
    const response = await apiClient.patch(`/cart/items/${productId}`, data);
    return response.data;
  },

  removeFromCart: async (productId: string) => {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete("/cart/clear");
    return response.data;
  },
};


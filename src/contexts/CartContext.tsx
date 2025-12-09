"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types/cart";
import { useToast } from "@/components/ui/use-toast";

// Utility functions for pending cart items
const PENDING_CART_KEY = "pendingCartItems";

interface PendingCartItem {
  productId: string;
  quantity: number;
}

const getPendingCartItems = (): PendingCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const items = localStorage.getItem(PENDING_CART_KEY);
    return items ? JSON.parse(items) : [];
  } catch {
    return [];
  }
};

const savePendingCartItems = (items: PendingCartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore localStorage errors
  }
};

const clearPendingCartItems = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_CART_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

const addPendingCartItem = (productId: string, quantity: number) => {
  const items = getPendingCartItems();
  const existingIndex = items.findIndex((item) => item.productId === productId);
  
  if (existingIndex >= 0) {
    items[existingIndex].quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  
  savePendingCartItems(items);
  return items;
};

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    if (!isAuthenticated || user?.role !== "customer") {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error: any) {
      console.error("Failed to load cart", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") {
      setCart(null);
      setLoading(false);
      return;
    }

    // Process pending cart items after login
    const processPendingItems = async () => {
      const pendingItems = getPendingCartItems();
      if (pendingItems.length > 0) {
        try {
          // Add all pending items to cart
          for (const item of pendingItems) {
            await cartService.addToCart({ productId: item.productId, quantity: item.quantity });
          }
          // Clear pending items
          clearPendingCartItems();
          // Refresh cart to show all items
          await refreshCart();
        } catch (error) {
          console.error("Failed to process pending cart items", error);
          // Still refresh cart even if pending items fail
          await refreshCart();
        }
      } else {
        await refreshCart();
      }
    };

    processPendingItems();
  }, [isAuthenticated, user]);

  const addToCart = async (productId: string, quantity: number, requireAuth: boolean = true) => {
    // If not authenticated and requireAuth is true, store in pending items
    if (!isAuthenticated || user?.role !== "customer") {
      if (requireAuth) {
        addPendingCartItem(productId, quantity);
        // Return a promise that resolves to indicate it was stored
        return Promise.resolve();
      } else {
        throw new Error("Authentication required");
      }
    }

    try {
      const response = await cartService.addToCart({ productId, quantity });
      if (response.success) {
        setCart(response.data);
        toast({
          title: "Added to Cart",
          description: "Product added to cart successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add to cart",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      const response = await cartService.updateCartItem(productId, { quantity });
      if (response.success) {
        setCart(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update cart",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        setCart(response.data);
        toast({
          title: "Removed from Cart",
          description: "Product removed from cart",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove from cart",
        variant: "destructive",
      });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to clear cart",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calculate item count including pending items if not logged in
  const getItemCount = () => {
    if (!isAuthenticated || user?.role !== "customer") {
      const pendingItems = getPendingCartItems();
      return pendingItems.reduce((sum, item) => sum + item.quantity, 0);
    }
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const itemCount = getItemCount();

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        refreshCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}


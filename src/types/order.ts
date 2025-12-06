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


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
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "in-transit";
  shippingAddress: string;
  delivererId?: string;
  delivery?: {
    _id: string;
    status: string;
    delivererId: string;
  };
  createdAt: string;
  updatedAt: string;
  assignedDeliverer?: {
    _id: string;
    fullName: string;
  };
  payment?: {
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
    amount: number;
  };
}

export interface OrderFilters {
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress?: any;
  paymentMethod?: string;
  fromCart?: boolean;
  status?: string;
}





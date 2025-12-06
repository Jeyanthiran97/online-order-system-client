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


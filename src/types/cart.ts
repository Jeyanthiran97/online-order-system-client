import { Product } from './product';

export interface CartItem {
  productId: string | Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  customerId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}


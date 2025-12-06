import { User } from "./user";

export interface Seller {
  _id: string;
  userId: string;
  shopName: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  verifiedAt?: string;
  user?: User;
}

export interface RegisterSellerData {
  email: string;
  password: string;
  shopName: string;
  documents?: string[];
}


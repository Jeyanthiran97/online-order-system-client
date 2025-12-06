import { User } from "./user";

export interface Deliverer {
  _id: string;
  userId: string;
  fullName: string;
  licenseNumber: string;
  NIC: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  verifiedAt?: string;
  user?: User;
}

export interface RegisterDelivererData {
  email: string;
  password: string;
  fullName: string;
  licenseNumber: string;
  NIC: string;
}


import api from "@/lib/api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
  sellerId: string;
  seller?: {
    shopName: string;
  };
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  availability?: "inStock" | "outOfStock";
  stockStatus?: "low" | "inStock" | "outOfStock";
  search?: string;
  sellerId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
}

export const productService = {
  getProducts: async (filters?: ProductFilters) => {
    const response = await api.get("/products", { params: filters });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<CreateProductData>) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};





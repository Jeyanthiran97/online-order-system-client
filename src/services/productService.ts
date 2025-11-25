import api from "@/lib/api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
  sellerId: string | {
    shopName: string;
  };
  seller?: {
    shopName: string;
  };
  images?: string[];
  mainImageIndex?: number;
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
  images?: File[];
  mainImageIndex?: number;
  existingImages?: string[];
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
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("category", data.category);
    
    if (data.mainImageIndex !== undefined) {
      formData.append("mainImageIndex", data.mainImageIndex.toString());
    }

    // Append image files
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<CreateProductData>) => {
    const formData = new FormData();
    
    if (data.name !== undefined) formData.append("name", data.name);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.price !== undefined) formData.append("price", data.price.toString());
    if (data.stock !== undefined) formData.append("stock", data.stock.toString());
    if (data.category !== undefined) formData.append("category", data.category);
    if (data.mainImageIndex !== undefined) {
      formData.append("mainImageIndex", data.mainImageIndex.toString());
    }

    // Handle existing images (for updates where we want to keep some images)
    if (data.existingImages !== undefined) {
      if (Array.isArray(data.existingImages)) {
        formData.append("existingImages", data.existingImages.join(","));
      } else {
        formData.append("existingImages", data.existingImages);
      }
    }

    // Append new image files
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await api.patch(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};





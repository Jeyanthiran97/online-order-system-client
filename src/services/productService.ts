import api from "@/lib/api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
  discount?: number;
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
  images?: string[]; // Changed from File[] to string[] (Cloudinary URLs)
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
    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      ...(data.mainImageIndex !== undefined && { mainImageIndex: data.mainImageIndex }),
      ...(data.images && data.images.length > 0 && { images: data.images }),
    };

    const response = await api.post("/products", payload);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<CreateProductData>) => {
    // Combine existing images and new images
    let allImages: string[] = [];
    
    if (data.existingImages && data.existingImages.length > 0) {
      allImages = [...data.existingImages];
    }
    
    if (data.images && data.images.length > 0) {
      allImages = [...allImages, ...data.images];
    }

    const payload: any = {};
    
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.price !== undefined) payload.price = data.price;
    if (data.stock !== undefined) payload.stock = data.stock;
    if (data.category !== undefined) payload.category = data.category;
    if (data.mainImageIndex !== undefined) payload.mainImageIndex = data.mainImageIndex;
    
    // Always send images array, even if empty, to ensure replacement
    // This allows removing all images by sending an empty array
    payload.images = allImages;

    const response = await api.patch(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};





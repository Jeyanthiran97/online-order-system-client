import apiClient from "@/lib/apiClient";
import { Product, ProductFilters, CreateProductData } from "@/types/product";

export type { Product, ProductFilters, CreateProductData };

export const productService = {
  getProducts: async (filters?: ProductFilters) => {
    const response = await apiClient.get("/products", { params: filters });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      ...(data.mainImageIndex !== undefined && {
        mainImageIndex: data.mainImageIndex,
      }),
      ...(data.images && data.images.length > 0 && { images: data.images }),
    };

    const response = await apiClient.post("/products", payload);
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
    if (data.mainImageIndex !== undefined)
      payload.mainImageIndex = data.mainImageIndex;

    // Always send images array, even if empty, to ensure replacement
    // This allows removing all images by sending an empty array
    payload.images = allImages;

    const response = await apiClient.patch(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};


import apiClient from "@/lib/apiClient";
import { Category, CreateCategoryData } from "@/types/category";

export type { Category, CreateCategoryData };

export const categoryService = {
  getCategories: async () => {
    const response = await apiClient.get("/categories/public");
    return response.data;
  },

  getAllCategories: async () => {
    const response = await apiClient.get("/categories");
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryData) => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};



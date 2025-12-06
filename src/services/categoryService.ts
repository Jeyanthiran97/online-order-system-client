import api from "@/lib/api";
import { Category, CreateCategoryData } from "@/types/category";

export type { Category, CreateCategoryData };

export const categoryService = {
  getCategories: async () => {
    const response = await api.get("/categories/public");
    return response.data;
  },

  getAllCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryData) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};




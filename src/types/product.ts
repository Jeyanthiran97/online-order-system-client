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


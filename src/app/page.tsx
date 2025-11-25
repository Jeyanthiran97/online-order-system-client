"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { productService, Product } from "@/services/productService";
import { categoryService, Category } from "@/services/categoryService";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "-updatedAt",
  });

  useEffect(() => {
    // Redirect sellers, deliverers, and admins away from public routes
    if (!authLoading && isAuthenticated && user) {
      if (user.role === "seller") {
        router.push("/seller");
        return;
      }
      if (user.role === "deliverer") {
        router.push("/deliverer");
        return;
      }
      if (user.role === "admin") {
        router.push("/admin");
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Only load products if user is not a seller/deliverer/admin
    // Note: filters.search is only updated when search is triggered, not on every keystroke
    if (!authLoading && (!isAuthenticated || user?.role === "customer")) {
      loadProducts();
    }
  }, [filters, authLoading, isAuthenticated, user]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        ...filters,
        availability: "inStock",
        limit: 20,
      });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error: any) {
      console.error("Failed to load products", error);
      // If it's a network error, show a helpful message
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error("Network error - check if API is accessible and CORS is configured");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      category: "",
      sort: "-updatedAt",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const hasActiveFilters = filters.search || filters.category || filters.sort !== "-updatedAt";

  // Show loading or nothing while redirecting
  if (authLoading || (isAuthenticated && user && (user.role === "seller" || user.role === "deliverer" || user.role === "admin"))) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Online Store</h1>
          <p className="text-muted-foreground">Discover amazing products from trusted sellers</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-primary" />
                </button>
              )}
            </div>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value })}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((category) => category.name && category.name.trim() !== "")
                  .map((category) => {
                    const categoryValue = (category.name?.trim() || category._id || `category-${category._id}`).trim();
                    if (!categoryValue || categoryValue === "") return null;
                    return (
                      <SelectItem key={category._id} value={categoryValue}>
                        {categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1)}
                      </SelectItem>
                    );
                  })
                  .filter(Boolean)}
              </SelectContent>
            </Select>
            <Select
              value={filters.sort}
              onValueChange={(value) => setFilters({ ...filters, sort: value })}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-updatedAt">Newest</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full md:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

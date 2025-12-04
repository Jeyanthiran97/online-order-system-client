"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { ProductCard } from "@/components/ProductCard";
import { productService, Product } from "@/services/productService";
import { categoryService, Category } from "@/services/categoryService";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, ShoppingBag, TrendingUp, Shield, Truck, AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { designSystem } from "@/lib/design-system";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/errorHandler";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
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
      // Reset to page 1 when filters change
      setCurrentPage(1);
      loadProducts(1);
    }
  }, [filters, authLoading, isAuthenticated, user]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
        setCategoriesError(null);
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setCategoriesError(errorMessage);
      
      // Only show toast for network errors to avoid spam
      if (error.isNetworkError || error.code === "ERR_NETWORK") {
        // Don't show toast on initial load, just set error state
        // Toast will be shown only if user retries
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setServerError(null);
    try {
      const response = await productService.getProducts({
        ...filters,
        availability: "inStock",
        page: page,
      });
      if (response.success) {
        if (append) {
          // Append new products to existing ones
          setProducts((prev) => [...prev, ...(response.data || [])]);
        } else {
          // Replace products with new ones
          setProducts(response.data || []);
        }
        
        // Check if there are more products
        const totalPages = response.totalPages || 0;
        setHasMore(page < totalPages);
        setCurrentPage(page);
        setServerError(null);
      }
    } catch (error: any) {
      const errorMessage = error.userMessage || getErrorMessage(error);
      setServerError(errorMessage);
      
      // Show toast notification for network errors
      if (error.isNetworkError || error.code === "ERR_NETWORK") {
        toast({
          title: "Connection Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(currentPage + 1, true);
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
    setCurrentPage(1);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Server Error Banner */}
      {(serverError || categoriesError) && (
        <div className="bg-red-50 border-b border-red-200">
          <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} py-3`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <WifiOff className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {serverError || categoriesError}
                  </p>
                  <p className="text-xs text-red-700 mt-0.5">
                    Some features may be unavailable. Please check your connection or try again later.
                  </p>
                </div>
              </div>
              {(serverError || categoriesError) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (serverError) loadProducts();
                    if (categoriesError) loadCategories();
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-100 flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} py-16 md:py-24 relative z-10`}>
          <div className="max-w-3xl mx-auto text-center space-y-5 animate-fade-in">
            <h1 className={`${designSystem.typography.h1} leading-tight`}>
              Discover Amazing
              <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mt-2">
                Products
              </span>
            </h1>
            <p className={`${designSystem.typography.body} text-white/90 max-w-2xl mx-auto text-base sm:text-lg`}>
              Shop from trusted sellers and get fast delivery. Your one-stop destination for quality products.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              <Button 
                size="lg" 
                variant="secondary" 
                className="hover:scale-105 transition-transform duration-200 shadow-lg"
                onClick={() => {
                  const productsSection = document.getElementById('products-section');
                  productsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-sm text-white hover:text-white transition-all duration-200"
                asChild
              >
                <Link href="/seller/register">
                  Become a Seller
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-10 bg-white/50">
        <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`flex items-start gap-3 ${designSystem.card.base} ${designSystem.card.hover} p-5 group`}>
              <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className={`${designSystem.typography.h4} mb-1`}>Wide Selection</h3>
                <p className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                  Browse thousands of products from verified sellers
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-3 ${designSystem.card.base} ${designSystem.card.hover} p-5 group`}>
              <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className={`${designSystem.typography.h4} mb-1`}>Secure Shopping</h3>
                <p className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                  Safe and secure transactions with buyer protection
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-3 ${designSystem.card.base} ${designSystem.card.hover} p-5 group`}>
              <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className={`${designSystem.typography.h4} mb-1`}>Fast Delivery</h3>
                <p className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                  Quick and reliable delivery to your doorstep
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main id="products-section" className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} ${designSystem.spacing.section}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`${designSystem.typography.h2} mb-1`}>Featured Products</h2>
              <p className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                Discover amazing products from trusted sellers
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className={designSystem.typography.small}>Updated Daily</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10 h-11 shadow-sm border-2 focus:border-primary transition-colors"
                />
                {searchInput && (
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-accent rounded-md transition-colors duration-200"
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
                <SelectTrigger className="w-full md:w-[180px] h-11 shadow-sm border-2">
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
                <SelectTrigger className="w-full md:w-[180px] h-11 shadow-sm border-2">
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
                  className="w-full md:w-auto h-11 shadow-sm border-2 transition-all duration-200 hover:scale-105"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          ) : serverError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3 opacity-75" />
              <p className={`${designSystem.typography.body} text-gray-700 mb-1 font-medium`}>
                Unable to load products
              </p>
              <p className={`${designSystem.typography.small} text-muted-foreground mb-4`}>
                {serverError}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(1);
                  loadProducts(1);
                }}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className={`${designSystem.typography.body} text-muted-foreground mb-1`}>No products found</p>
              <p className={designSystem.typography.small}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className={designSystem.grid.products}>
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {loadingMore ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More Products"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/services/orderService";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    // Only load product if user is not a seller/deliverer/admin
    if (
      params.id &&
      !authLoading &&
      (!isAuthenticated || user?.role === "customer")
    ) {
      loadProduct();
    }
  }, [params.id, authLoading, isAuthenticated, user]);

  const loadProduct = async () => {
    try {
      const response = await productService.getProduct(params.id as string);
      if (response.success) {
        setProduct(response.data);
        // Set initial image index to main image
        if (response.data.mainImageIndex !== undefined) {
          setSelectedImageIndex(response.data.mainImageIndex);
        }
      }
    } catch (error) {
      console.error("Failed to load product", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return `${API_URL.replace("/api", "")}${imagePath}`;
  };

  const getProductImages = () => {
    if (!product?.images || product.images.length === 0) return [];
    return product.images
      .map((img) => getImageUrl(img))
      .filter(Boolean) as string[];
  };

  const images = getProductImages();

  const handleOrder = async () => {
    if (!isAuthenticated || user?.role !== "customer") {
      toast({
        title: "Login Required",
        description: "Please login as a customer to place orders",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (!user.profile?.address) {
      toast({
        title: "Address Required",
        description: "Please update your address in your profile",
        variant: "destructive",
      });
      router.push("/customer/profile");
      return;
    }

    setOrdering(true);
    try {
      const response = await orderService.createOrder({
        items: [
          {
            productId: product!._id,
            quantity,
            price: product!.price,
          },
        ],
        shippingAddress: user.profile.address,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Order placed successfully",
        });
        router.push("/customer/orders");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setOrdering(false);
    }
  };

  // Show loading or redirect if user is seller/deliverer/admin
  if (
    authLoading ||
    (isAuthenticated &&
      user &&
      (user.role === "seller" ||
        user.role === "deliverer" ||
        user.role === "admin"))
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading product..." />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {/* Main Image */}
            <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden mb-4 relative group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            (prev) => (prev - 1 + images.length) % images.length
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            (prev) => (prev + 1) % images.length
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary scale-105"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">
                    {formatCurrency(product.price)}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Category: {product.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {product.stock} available
                  </p>
                  {typeof product.sellerId === "object" &&
                    product.sellerId?.shopName && (
                      <p className="text-sm text-muted-foreground">
                        Seller: {product.sellerId.shopName}
                      </p>
                    )}
                </div>
                {isAuthenticated && user?.role === "customer" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(
                                product.stock,
                                parseInt(e.target.value) || 1
                              )
                            )
                          )
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleOrder}
                      disabled={
                        ordering ||
                        product.stock === 0 ||
                        quantity > product.stock
                      }
                    >
                      {ordering
                        ? "Placing Order..."
                        : product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

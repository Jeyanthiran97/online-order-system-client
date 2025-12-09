"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { productService } from "@/services/product.service";
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
import { useCart } from "@/contexts/CartContext";
import { cartService } from "@/services/cart.service";
import { useToast } from "@/components/ui/use-toast";

// Import localStorage utilities
const PENDING_CART_KEY = "pendingCartItems";

interface PendingCartItem {
  productId: string;
  quantity: number;
}

const addPendingCartItem = (productId: string, quantity: number) => {
  if (typeof window === "undefined") return;
  try {
    const items: PendingCartItem[] = JSON.parse(localStorage.getItem(PENDING_CART_KEY) || "[]");
    const existingIndex = items.findIndex((item) => item.productId === productId);
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    
    localStorage.setItem(PENDING_CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore localStorage errors
  }
};

const removePendingCartItem = (productId: string) => {
  if (typeof window === "undefined") return;
  try {
    const items: PendingCartItem[] = JSON.parse(localStorage.getItem(PENDING_CART_KEY) || "[]");
    const filtered = items.filter((item) => item.productId !== productId);
    localStorage.setItem(PENDING_CART_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore localStorage errors
  }
};
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthModal } from "@/components/auth/AuthModal";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAddToCart, setPendingAddToCart] = useState<{ productId: string; quantity: number } | null>(null);

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

  const handleAddToCart = async () => {
    if (!product) return;

    // If not logged in, store pending action in localStorage and state, then open auth modal
    if (!isAuthenticated || user?.role !== "customer") {
      // Store in localStorage (will be processed by CartContext after login)
      addPendingCartItem(product._id, quantity);
      // Store in state (for explicit addition after login)
      setPendingAddToCart({ productId: product._id, quantity });
      setAuthModalOpen(true);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity, true);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      // Error is handled in CartContext
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    // If not logged in, open auth modal
    if (!isAuthenticated || user?.role !== "customer") {
      setAuthModalOpen(true);
      return;
    }

    // Redirect to order page with product details
    router.push(`/cart?buyNow=${product._id}&quantity=${quantity}`);
  };

  // Handle post-login cart addition
  useEffect(() => {
    const handlePostLoginAddToCart = async () => {
      if (pendingAddToCart && isAuthenticated && user?.role === "customer") {
        setAddingToCart(true);
        try {
          // Wait for CartContext to process localStorage items (it processes them automatically)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if item is already in cart (CartContext might have added it from localStorage)
          const cartResponse = await cartService.getCart();
          const existingItem = cartResponse.data?.items?.find((item: any) => 
            (typeof item.productId === 'string' ? item.productId : item.productId._id) === pendingAddToCart.productId
          );
          
          if (!existingItem) {
            // Item not in cart yet, add it explicitly
            // Remove from localStorage first to prevent duplicate
            removePendingCartItem(pendingAddToCart.productId);
            await addToCart(pendingAddToCart.productId, pendingAddToCart.quantity, true);
          } else {
            // Item already in cart (added by CartContext), just show success
            // Remove from localStorage to clean up
            removePendingCartItem(pendingAddToCart.productId);
          }
          
          setQuantity(1);
          toast({
            title: "Added to Cart",
            description: "Product added to cart successfully",
          });
        } catch (error) {
          // Error is handled in CartContext, but show a message anyway
          console.error("Failed to add product to cart after login", error);
          toast({
            title: "Error",
            description: "Failed to add product to cart. Please try again.",
            variant: "destructive",
          });
        } finally {
          setAddingToCart(false);
          setPendingAddToCart(null);
        }
      }
    };

    handlePostLoginAddToCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, pendingAddToCart]);

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading product..." />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/50 hover:bg-foreground/70 text-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/50 hover:bg-foreground/70 text-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                      <Star className="h-5 w-5 fill-rating-filled text-rating-filled" />
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
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleBuyNow}
                      disabled={
                        product.stock === 0 ||
                        quantity > product.stock
                      }
                    >
                      {product.stock === 0
                        ? "Out of Stock"
                        : "Buy Now"}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={
                        addingToCart ||
                        product.stock === 0 ||
                        quantity > product.stock
                      }
                    >
                      {addingToCart
                        ? "Adding..."
                        : product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AuthModal
        open={authModalOpen}
        onOpenChange={(open) => {
          setAuthModalOpen(open);
          // Clear pending action if modal is closed without login
          if (!open && !isAuthenticated) {
            setPendingAddToCart(null);
          }
        }}
        initialMode="login"
        skipRedirect={!!pendingAddToCart}
      />
    </div>
  );
}

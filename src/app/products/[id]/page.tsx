"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { productService, Product } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/services/orderService";
import { useToast } from "@/components/ui/use-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const response = await productService.getProduct(params.id as string);
      if (response.success) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error("Failed to load product", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center mb-4">
              <Package className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock} available</p>
                  {product.seller && (
                    <p className="text-sm text-muted-foreground">Seller: {product.seller.shopName}</p>
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
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleOrder}
                      disabled={ordering || product.stock === 0 || quantity > product.stock}
                    >
                      {ordering ? "Placing Order..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
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


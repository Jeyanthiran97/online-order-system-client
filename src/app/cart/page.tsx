"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types/product";

function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, loading, updateCartItem, removeFromCart, clearCart, refreshCart, addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("dummy");
  const [initializing, setInitializing] = useState(true);
  const buyNowProcessedRef = useRef<string | null>(null);

  // Handle "Buy Now" functionality - only run once when component mounts with buyNow params
  useEffect(() => {
    const buyNowProductId = searchParams.get("buyNow");
    const buyNowQuantity = searchParams.get("quantity");

    // Reset processed ref when query params are removed
    if (!buyNowProductId) {
      buyNowProcessedRef.current = null;
      if (!loading) {
        setInitializing(false);
      }
      return;
    }

    // Only process if we have params, user is authenticated, and we haven't processed this product yet
    if (
      buyNowProductId && 
      buyNowQuantity && 
      isAuthenticated && 
      user?.role === "customer" &&
      buyNowProcessedRef.current !== buyNowProductId &&
      !loading
    ) {
      // Mark as processed immediately to prevent duplicate additions
      buyNowProcessedRef.current = buyNowProductId;
      
      // Add product to cart and proceed to checkout
      const addAndCheckout = async () => {
        try {
          await addToCart(buyNowProductId, parseInt(buyNowQuantity), true);
          // Wait a bit for cart to update
          await new Promise(resolve => setTimeout(resolve, 300));
          // Refresh cart to get latest state
          await refreshCart();
          // Remove query params after adding
          router.replace("/cart");
          toast({
            title: "Added to Cart",
            description: "Proceeding to checkout",
          });
        } catch (error) {
          console.error("Failed to add product for buy now", error);
          // Reset processed ref on error so user can retry
          buyNowProcessedRef.current = null;
        } finally {
          setInitializing(false);
        }
      };
      addAndCheckout();
    } else if (!buyNowProductId && !loading) {
      setInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), isAuthenticated, user?.role]);

  useEffect(() => {
    if (!initializing && (!isAuthenticated || user?.role !== "customer")) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router, initializing]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cart?.items.find((i) => 
      (typeof i.productId === 'string' ? i.productId : i.productId._id) === productId
    );
    if (item) {
      const product = typeof item.productId === 'object' ? item.productId : null;
      if (product && product.stock < newQuantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} available`,
          variant: "destructive",
        });
        return;
      }
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      // Process dummy payment
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate payment processing

      // Create order from cart
      const response = await orderService.createOrder({
        items: cart.items.map((item) => ({
          productId: typeof item.productId === 'string' ? item.productId : item.productId._id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: paymentMethod,
        fromCart: true,
      });

      if (response.success) {
        // Clear cart ONLY after successful order creation
        try {
          await clearCart();
        } catch (clearError) {
          console.error("Failed to clear cart after order creation:", clearError);
          // Don't block success flow if clearing cart fails, but maybe warn user or retry
        }
        
        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully",
          variant: "success",
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
      setProcessing(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setProcessing(true);
    try {
      const items = cart.items.map((item) => ({
        productId: typeof item.productId === 'string' ? item.productId : item.productId._id,
        quantity: item.quantity,
      }));

      const { url } = await paymentService.createCheckoutSession(items);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error.response?.data?.error || "Failed to initiate checkout",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const onCheckoutClick = () => {
    if (paymentMethod === "stripe") {
      handleStripeCheckout();
    } else {
      handleCheckout();
    }
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading cart..." />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start shopping to add items to your cart
              </p>
              <Button onClick={() => router.push("/")}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>
                  {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item, index) => {
                  const product = typeof item.productId === 'object' 
                    ? item.productId as Product 
                    : null;
                  const productId = typeof item.productId === 'string' 
                    ? item.productId 
                    : item.productId._id;
                  
                  if (!product) return null;

                  // Use combination of productId and index to ensure unique keys
                  // This handles cases where same product might appear multiple times (shouldn't happen, but safe)
                  const uniqueKey = `${productId}-${index}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].startsWith('http') 
                              ? product.images[0] 
                              : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                        <p className="text-lg font-bold mt-2">
                          {formatCurrency(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(productId, item.quantity + 1)}
                            disabled={product.stock <= item.quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(productId)}
                            className="ml-auto"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Subtotal: {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="payment">Payment Method</Label>
                  <select
                    id="payment"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="dummy">Dummy Payment (Always Success)</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="stripe">Stripe (Online Payment)</option>
                  </select>
                </div>


                <Button
                  className="w-full"
                  onClick={onCheckoutClick}
                  disabled={processing}
                >
                  {processing ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}


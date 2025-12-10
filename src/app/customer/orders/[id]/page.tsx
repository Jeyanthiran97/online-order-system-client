"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { orderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { designSystem } from "@/lib/design-system";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    loadOrder();
  }, [resolvedParams.id]);

  const loadOrder = async () => {
    try {
      const response = await orderService.getOrder(resolvedParams.id);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load order details",
        variant: "destructive",
      });
      // Redirect back to orders list on error
      setTimeout(() => router.push("/customer/orders"), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button onClick={() => router.push("/customer/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} py-8`}>
        <div className="mb-6">
          <Link href="/customer/orders">
            <Button variant="ghost" className="mb-4 hover:bg-primary/10 transition-colors duration-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`${designSystem.typography.h2} mb-2`}>
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
            <StatusBadge status={order.status as any} className="text-lg px-4 py-1.5">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </StatusBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg bg-card/50">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.productName || 'Product'}</h3>
                      <div className="flex justify-between items-end">
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                        <div className="font-bold text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-2 border-t text-primary">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{(order.customerId as any)?.fullName || 'Customer'}</p>
                  <p className="text-muted-foreground">{(order.customerId as any)?.address || 'No address provided'}</p>
                  <p className="text-muted-foreground">{(order.customerId as any)?.phone || 'No phone provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <span className="font-medium capitalize">{order.payment?.paymentMethod || 'Card'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Paid
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            {order.assignedDeliverer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="h-4 w-4 text-primary" />
                    Delivery Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.assignedDeliverer.fullName}</p>
                        <p className="text-xs text-muted-foreground">Your Deliverer</p>
                      </div>
                    </div>
                    
                    <div className="relative pl-4 border-l-2 border-muted space-y-6">
                      <div className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${
                          ['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${
                          ['confirmed', 'shipped', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <p className="text-sm font-medium">Confirmed</p>
                      </div>

                      <div className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${
                          ['shipped', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <p className="text-sm font-medium">Shipped</p>
                      </div>

                      <div className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${
                          order.status === 'delivered' ? 'bg-primary' : 'bg-muted'
                        }`} />
                        <p className="text-sm font-medium">Delivered</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

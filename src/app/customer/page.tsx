"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ShoppingCart, CheckCircle, TrendingUp, ArrowRight, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { designSystem } from "@/lib/design-system";
import { StatusBadge } from "@/components/ui/status-badge";

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    // Wait for auth to be ready before loading data
    if (!authLoading) {
      loadOrders();
    }
  }, [authLoading]);

  const loadOrders = async () => {
    try {
      // Fetch recent orders for the list
      const recentResponse = await orderService.getOrders({ limit: 5, sort: "-createdAt" });
      if (recentResponse.success) {
        setOrders(recentResponse.data || []);
      }

      // Fetch all orders for stats
      // Using a high limit to ensure we get all orders for accurate stats
      // Ideally, backend should provide a stats endpoint
      const allOrdersResponse = await orderService.getOrders({ limit: 1000 });
      if (allOrdersResponse.success) {
        const allOrders = allOrdersResponse.data || [];
        const totalSpent = allOrders.reduce((sum: number, order: Order) => {
            if (order.status !== 'cancelled') {
                return sum + (order.totalAmount || 0);
            }
            return sum;
        }, 0);
        
        setStats({
          total: allOrders.length,
          pending: allOrders.filter((o: Order) => o.status === "pending").length,
          confirmed: allOrders.filter((o: Order) => o.status === "confirmed").length,
          shipped: allOrders.filter((o: Order) => o.status === "shipped" || o.status === "in-transit").length,
          delivered: allOrders.filter((o: Order) => o.status === "delivered").length,
          cancelled: allOrders.filter((o: Order) => o.status === "cancelled").length,
          totalSpent,
        });
      }
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };


  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} ${designSystem.spacing.section}`}>
        {/* Header Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`${designSystem.typography.h1} mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}>
                Welcome back!
              </h1>
              <p className={`${designSystem.typography.body} ${designSystem.typography.muted}`}>
                {user?.email}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="hidden md:flex transition-all duration-200 hover:scale-105">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "0ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Total Orders</CardTitle>
                <div className="p-2 bg-info-light rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <ShoppingCart className="h-4 w-4 text-info" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{stats.total}</p>
              <p className={designSystem.typography.small}>All time</p>
            </CardContent>
          </Card>

          <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "50ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Pending</CardTitle>
                <div className="p-2 bg-warning-light rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{stats.pending}</p>
              <p className={designSystem.typography.small}>Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Confirmed</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{stats.confirmed}</p>
              <p className={designSystem.typography.small}>Processing</p>
            </CardContent>
          </Card>

          <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "150ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Shipped</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <Truck className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{stats.shipped}</p>
              <p className={designSystem.typography.small}>On the way</p>
            </CardContent>
          </Card>

          <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Delivered</CardTitle>
                <div className="p-2 bg-success-light rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{stats.delivered}</p>
              <p className={designSystem.typography.small}>Completed</p>
            </CardContent>
          </Card>

           <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "250ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Cancelled</CardTitle>
                <div className="p-2 bg-destructive/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <Package className="h-4 w-4 text-destructive" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{stats.cancelled}</p>
              <p className={designSystem.typography.small}>Cancelled orders</p>
            </CardContent>
          </Card>

          <Card className={`${designSystem.card.base} ${designSystem.card.hover} animate-scale-in`} style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${designSystem.typography.small} font-medium ${designSystem.typography.muted}`}>Total Spent</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg transition-transform duration-200 group-hover:scale-110">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`${designSystem.typography.h2} mb-1`}>{formatCurrency(stats.totalSpent)}</p>
              <p className={designSystem.typography.small}>Active orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className={`${designSystem.card.base} shadow-lg animate-fade-in`} style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`${designSystem.typography.h2} mb-1`}>Recent Orders</CardTitle>
                <CardDescription className={designSystem.typography.small}>Your latest order history and status</CardDescription>
              </div>
              <Button asChild className={`${designSystem.button.base} ${designSystem.button.hover}`}>
                <Link href="/customer/orders">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <LoadingSpinner text="Loading orders..." />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className={`${designSystem.typography.body} font-medium mb-1`}>No orders yet</p>
                <p className={`${designSystem.typography.small} ${designSystem.typography.muted} mb-4`}>
                  Start shopping to see your orders here
                </p>
                <Link href="/">
                  <Button className={`${designSystem.button.base} ${designSystem.button.hover}`}>
                    Start Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <div
                    key={order._id}
                    className={`flex items-center justify-between ${designSystem.card.base} ${designSystem.card.hover} p-4 border-2 hover:border-primary/50 group animate-fade-in`}
                    style={{ animationDelay: `${(index + 1) * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors duration-200 flex-shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/customer/orders/${order._id}`} className="hover:underline">
                            <p className={`${designSystem.typography.h4} mb-1 group-hover:text-primary transition-colors duration-200 truncate`}>
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                        </Link>
                        <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                          <span className={`flex items-center gap-1 ${designSystem.typography.small}`}>
                            <Package className="h-3 w-3 flex-shrink-0" />
                            {order.items?.length || 0} items
                          </span>
                          <span className={designSystem.typography.small}>•</span>
                          <span className={`${designSystem.typography.small} font-semibold text-foreground`}>
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <span className={designSystem.typography.small}>•</span>
                          <span className={designSystem.typography.small}>
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={order.status as any}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </StatusBadge>
                      <Link href={`/customer/orders/${order._id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

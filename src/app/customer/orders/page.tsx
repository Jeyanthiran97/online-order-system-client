"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Filter,
  ArrowLeft,
  Calendar,
  DollarSign
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { designSystem } from "@/lib/design-system";
import { StatusBadge } from "@/components/ui/status-badge";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        ...(statusFilter && { status: statusFilter }),
        sort: "-createdAt",
      });
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      const response = await orderService.updateOrder(orderId, { status: "cancelled" });
      if (response.success) {
        toast({
          title: "Success",
          description: "Order cancelled successfully",
          variant: "success",
        });
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel order",
        variant: "destructive",
      });
    }
  };


  const filteredOrdersCount = orders.filter((order) => 
    !statusFilter || order.status === statusFilter
  ).length;

  return (
    <main className="min-h-screen bg-background">
      <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} ${designSystem.spacing.section}`}>
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <Link href="/customer">
            <Button variant="ghost" className="mb-4 hover:bg-primary/10 transition-colors duration-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`${designSystem.typography.h1} mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}>
                My Orders
              </h1>
              <p className={`${designSystem.typography.body} ${designSystem.typography.muted}`}>
                View and manage all your orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={statusFilter || "all"} 
                onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-[180px] h-11 border-2 shadow-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <Card className={`${designSystem.card.base} shadow-lg`}>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className={`${designSystem.typography.h3} mb-2`}>No orders found</h3>
                <p className={`${designSystem.typography.body} ${designSystem.typography.muted} mb-5`}>
                  {statusFilter 
                    ? `No orders with status "${statusFilter}"`
                    : "You haven't placed any orders yet"}
                </p>
                {!statusFilter && (
                  <Link href="/">
                    <Button size="lg" className={`${designSystem.button.base} ${designSystem.button.hover}`}>
                      Start Shopping
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className={`mb-3 ${designSystem.typography.small} ${designSystem.typography.muted} animate-fade-in`}>
              Showing {filteredOrdersCount} order{filteredOrdersCount !== 1 ? 's' : ''}
              {statusFilter && ` with status "${statusFilter}"`}
            </div>
            {orders.map((order, index) => (
              <Card 
                key={order._id} 
                id={`order-${order._id}`}
                className={`${designSystem.card.base} ${designSystem.card.hover} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-muted rounded-lg flex-shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className={`${designSystem.typography.h3} mb-1`}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <CardDescription className={`flex items-center gap-3 flex-wrap ${designSystem.typography.small}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 flex-shrink-0" />
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className={`${designSystem.typography.small} ${designSystem.typography.muted} flex items-center gap-1 justify-end mb-1`}>
                          <DollarSign className="h-3.5 w-3.5" />
                          Total Amount
                        </div>
                        <div className={`${designSystem.typography.h2} text-primary`}>
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status as any}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(order.status === "pending" || order.status === "confirmed") && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancel(order._id)}
                          className={`${designSystem.button.base} ${designSystem.button.hover}`}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Order
                        </Button>
                      )}
                      <Link href={`/products?order=${order._id}`}>
                        <Button variant="outline" className={`${designSystem.button.base} ${designSystem.button.hover}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className={`${designSystem.typography.small} font-semibold mb-2 ${designSystem.typography.muted}`}>Order Items:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                            • {item.productName || 'Product'} (x{item.quantity || 1})
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                            • and {order.items.length - 3} more item{(order.items.length - 3) !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


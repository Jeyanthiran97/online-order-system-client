"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderService } from "@/services/order.service";
import { Order } from "@/types/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function SellerOrdersPage() {
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

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const response = await orderService.updateOrder(orderId, { status });
      if (response.success) {
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No orders found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-sm">
                      #{order._id.slice(-8)}
                    </TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(order._id, "confirmed")}
                        >
                          Confirm
                        </Button>
                      )}
                      {order.status === "confirmed" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order._id, "shipped")}
                            disabled={!order.delivererId}
                          >
                            Ship
                          </Button>
                          {!order.delivererId && (
                            <span className="text-xs text-muted-foreground">
                              Admin must assign deliverer
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


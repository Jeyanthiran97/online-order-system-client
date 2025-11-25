"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderService, Order } from "@/services/orderService";
import { adminService } from "@/services/adminService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliverers, setDeliverers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, deliverersRes] = await Promise.all([
        orderService.getOrders({
          ...(statusFilter && { status: statusFilter }),
          sort: "-createdAt",
        }),
        adminService.getDeliverers({ status: "approved" }),
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.data || []);
      }

      if (deliverersRes.success) {
        setDeliverers(deliverersRes.data || []);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDeliverer = async (orderId: string, delivererId: string) => {
    try {
      const response = await orderService.updateOrder(orderId, { assignedDelivererId: delivererId });
      if (response.success) {
        toast({
          title: "Success",
          description: "Deliverer assigned successfully",
        });
        loadData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to assign deliverer",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await orderService.updateOrder(orderId, { status: newStatus });
      if (response.success) {
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
        loadData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update order status",
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
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <TableHead>Deliverer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order._id || `order-${index}`}>
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
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.delivererId ? (
                        <span className="text-sm">Assigned</span>
                      ) : (
                        <Select
                          onValueChange={(value) => handleAssignDeliverer(order._id, value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliverers
                              .filter((deliverer) => {
                                const id = deliverer._id;
                                return id && String(id).trim() !== "";
                              })
                              .map((deliverer, idx) => {
                                const delivererValue = String(deliverer._id).trim();
                                if (!delivererValue || delivererValue === "") return null;
                                return (
                                  <SelectItem key={deliverer._id || `deliverer-${idx}`} value={delivererValue}>
                                    {deliverer.fullName}
                                  </SelectItem>
                                );
                              })
                              .filter(Boolean)}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(order._id, "confirmed")}
                          >
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(order._id, "shipped")}
                              disabled={!order.delivererId}
                            >
                              Ship
                            </Button>
                            {!order.delivererId && (
                              <span className="text-xs text-muted-foreground self-center">
                                Assign deliverer first
                              </span>
                            )}
                          </>
                        )}
                        {order.status === "shipped" && (
                          <span className="text-sm text-muted-foreground">
                            Awaiting delivery
                          </span>
                        )}
                        {(order.status === "delivered" || order.status === "cancelled") && (
                          <span className="text-sm text-muted-foreground capitalize">
                            {order.status}
                          </span>
                        )}
                      </div>
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


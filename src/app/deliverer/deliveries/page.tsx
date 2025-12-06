"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deliveryService } from "@/services/delivery.service";
import { Delivery } from "@/types/delivery";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DelivererDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryService.getDeliveries();
      if (response.success) {
        let deliveriesData = response.data || [];
        if (statusFilter) {
          deliveriesData = deliveriesData.filter((d: Delivery) => d.status === statusFilter);
        }
        setDeliveries(deliveriesData);
      }
    } catch (error) {
      console.error("Failed to load deliveries", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, status: "pending" | "in-transit" | "delivered") => {
    try {
      const response = await deliveryService.updateDeliveryStatus(deliveryId, status);
      if (response.success) {
        toast({
          title: "Success",
          description: "Delivery status updated successfully",
        });
        loadDeliveries();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update delivery",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Deliveries</h1>
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No deliveries found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell className="font-mono text-sm">
                      #{delivery.orderId.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          delivery.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : delivery.status === "in-transit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {delivery.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(delivery._id, "in-transit")}
                        >
                          Start Delivery
                        </Button>
                      )}
                      {delivery.status === "in-transit" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(delivery._id, "delivered")}
                        >
                          Mark Delivered
                        </Button>
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


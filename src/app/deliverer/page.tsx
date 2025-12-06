"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deliveryService } from "@/services/delivery.service";
import { Delivery } from "@/types/delivery";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";

export default function DelivererDashboard() {
  const { loading: authLoading } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
  });

  useEffect(() => {
    // Wait for auth to be ready before loading data
    if (!authLoading) {
      loadDeliveries();
    }
  }, [authLoading]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryService.getDeliveries();
      if (response.success) {
        const deliveriesData = response.data || [];
        setDeliveries(deliveriesData);
        setStats({
          total: deliveriesData.length,
          pending: deliveriesData.filter((d: Delivery) => d.status === "pending").length,
          inTransit: deliveriesData.filter((d: Delivery) => d.status === "in-transit").length,
          delivered: deliveriesData.filter((d: Delivery) => d.status === "delivered").length,
        });
      }
    } catch (error) {
      console.error("Failed to load deliveries", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Deliverer Dashboard</h1>
        <p className="text-muted-foreground">Manage your deliveries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              In Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.inTransit}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.delivered}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner text="Loading deliveries..." />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No deliveries assigned</div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #{delivery.orderId.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        delivery.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : delivery.status === "in-transit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

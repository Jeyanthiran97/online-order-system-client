"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService, Deliverer } from "@/services/adminService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminDeliverersPage() {
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadDeliverers();
  }, [statusFilter]);

  const loadDeliverers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDeliverers({
        ...(statusFilter && { status: statusFilter }),
        sort: "-createdAt",
      });
      if (response.success) {
        setDeliverers(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load deliverers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await adminService.approveDeliverer(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Deliverer approved successfully",
        });
        loadDeliverers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve deliverer",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectReason[id];
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await adminService.rejectDeliverer(id, reason);
      if (response.success) {
        toast({
          title: "Success",
          description: "Deliverer rejected successfully",
        });
        setRejectReason({ ...rejectReason, [id]: "" });
        loadDeliverers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject deliverer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Deliverers</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliverer Approval Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : deliverers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No deliverers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliverers.map((deliverer) => (
                  <TableRow key={deliverer._id}>
                    <TableCell className="font-medium">{deliverer.fullName}</TableCell>
                    <TableCell>{deliverer.user?.email || "N/A"}</TableCell>
                    <TableCell>{deliverer.licenseNumber}</TableCell>
                    <TableCell>{deliverer.NIC}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          deliverer.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : deliverer.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {deliverer.status}
                      </span>
                    </TableCell>
                    <TableCell>{deliverer.reason || "-"}</TableCell>
                    <TableCell>
                      {deliverer.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(deliverer._id)}
                          >
                            Approve
                          </Button>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Rejection reason"
                              value={rejectReason[deliverer._id] || ""}
                              onChange={(e) =>
                                setRejectReason({ ...rejectReason, [deliverer._id]: e.target.value })
                              }
                              className="w-40"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(deliverer._id)}
                            >
                              Reject
                            </Button>
                          </div>
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


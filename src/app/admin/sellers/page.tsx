"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService, Seller } from "@/services/adminService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSellers();
  }, [statusFilter]);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSellers({
        ...(statusFilter && { status: statusFilter }),
        sort: "-createdAt",
      });
      if (response.success) {
        setSellers(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load sellers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await adminService.approveSeller(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Seller approved successfully",
        });
        loadSellers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve seller",
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
      const response = await adminService.rejectSeller(id, reason);
      if (response.success) {
        toast({
          title: "Success",
          description: "Seller rejected successfully",
        });
        setRejectReason({ ...rejectReason, [id]: "" });
        loadSellers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject seller",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sellers</h1>
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
          <CardTitle>Seller Approval Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sellers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller._id}>
                    <TableCell className="font-medium">{seller.shopName}</TableCell>
                    <TableCell>{seller.user?.email || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          seller.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : seller.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {seller.status}
                      </span>
                    </TableCell>
                    <TableCell>{seller.reason || "-"}</TableCell>
                    <TableCell>
                      {seller.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(seller._id)}
                          >
                            Approve
                          </Button>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Rejection reason"
                              value={rejectReason[seller._id] || ""}
                              onChange={(e) =>
                                setRejectReason({ ...rejectReason, [seller._id]: e.target.value })
                              }
                              className="w-40"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(seller._id)}
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


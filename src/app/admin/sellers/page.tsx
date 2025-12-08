"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/services/user.service";
import { Seller } from "@/types/seller";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    sellerId: string | null;
    sellerName: string;
    currentReason?: string;
  }>({
    open: false,
    type: null,
    sellerId: null,
    sellerName: "",
    currentReason: "",
  });
  const [modalReason, setModalReason] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadSellers();
  }, [statusFilter]);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const response = await userService.getSellers({
        ...(statusFilter && { status: statusFilter }),
        sort: "-createdAt",
      });
      if (response.success) {
        // API returns sellers with userId populated, so email is at seller.userId.email
        const sellersData = (response.data || []).map((seller: any) => ({
          _id: seller._id,
          userId: seller.userId,
          shopName: seller.shopName,
          status: seller.status,
          reason: seller.reason,
          verifiedAt: seller.verifiedAt,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt,
          // Extract user email from populated userId
          user: seller.userId ? {
            email: seller.userId.email,
            _id: seller.userId._id,
            role: seller.userId.role,
            isActive: seller.userId.isActive,
          } : null,
        }));
        setSellers(sellersData);
      }
    } catch (error) {
      console.error("Failed to load sellers", error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (seller: Seller, type: "approve" | "reject") => {
    setStatusModal({
      open: true,
      type,
      sellerId: seller._id,
      sellerName: seller.shopName,
      currentReason: seller.reason || "",
    });
    setModalReason(seller.reason || "");
  };

  const closeStatusModal = () => {
    setStatusModal({
      open: false,
      type: null,
      sellerId: null,
      sellerName: "",
      currentReason: "",
    });
    setModalReason("");
  };

  const handleStatusChange = async () => {
    if (!statusModal.sellerId || !statusModal.type) return;

    if (statusModal.type === "reject" && !modalReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      let response;
      if (statusModal.type === "approve") {
        response = await userService.approveSeller(statusModal.sellerId);
      } else {
        response = await userService.rejectSeller(statusModal.sellerId, modalReason);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Seller ${statusModal.type === "approve" ? "approved" : "rejected"} successfully`,
        });
        closeStatusModal();
        loadSellers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${statusModal.type} seller`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sellers</h1>
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
                {sellers.map((seller, index) => (
                  <TableRow key={seller._id || `seller-${index}`}>
                    <TableCell className="font-medium">{seller.shopName}</TableCell>
                    <TableCell>{seller.user?.email || "N/A"}</TableCell>
                    <TableCell>
                      <StatusBadge status={seller.status as any}>
                        {seller.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{seller.reason || "-"}</span>
                        {seller.reason && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => openStatusModal(seller, "reject")}
                            title="Edit reason"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {seller.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openStatusModal(seller, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openStatusModal(seller, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {seller.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(seller, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        {seller.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(seller, "approve")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
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

      <Dialog open={statusModal.open} onOpenChange={(open) => !open && closeStatusModal()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {statusModal.type === "approve" ? "Approve Seller" : "Reject Seller"}
            </DialogTitle>
            <DialogDescription>
              {statusModal.type === "approve" 
                ? `Are you sure you want to approve "${statusModal.sellerName}"?`
                : `Are you sure you want to reject "${statusModal.sellerName}"? Please provide a reason below.`}
            </DialogDescription>
          </DialogHeader>
          {statusModal.type === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeStatusModal}
            >
              Cancel
            </Button>
            <Button
              variant={statusModal.type === "reject" ? "destructive" : "default"}
              onClick={handleStatusChange}
              disabled={statusModal.type === "reject" && !modalReason.trim()}
            >
              {statusModal.type === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


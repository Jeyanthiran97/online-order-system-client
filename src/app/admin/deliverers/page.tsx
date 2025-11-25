"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService, Deliverer } from "@/services/adminService";
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

export default function AdminDeliverersPage() {
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    delivererId: string | null;
    delivererName: string;
    currentReason?: string;
  }>({
    open: false,
    type: null,
    delivererId: null,
    delivererName: "",
    currentReason: "",
  });
  const [modalReason, setModalReason] = useState<string>("");
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
        // API returns deliverers with userId populated, so email is at deliverer.userId.email
        const deliverersData = (response.data || []).map((deliverer: any) => ({
          _id: deliverer._id,
          userId: deliverer.userId,
          fullName: deliverer.fullName,
          licenseNumber: deliverer.licenseNumber,
          NIC: deliverer.NIC,
          status: deliverer.status,
          reason: deliverer.reason,
          verifiedAt: deliverer.verifiedAt,
          createdAt: deliverer.createdAt,
          updatedAt: deliverer.updatedAt,
          // Extract user email from populated userId
          user: deliverer.userId ? {
            email: deliverer.userId.email,
            _id: deliverer.userId._id,
            role: deliverer.userId.role,
            isActive: deliverer.userId.isActive,
          } : null,
        }));
        setDeliverers(deliverersData);
      }
    } catch (error) {
      console.error("Failed to load deliverers", error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (deliverer: Deliverer, type: "approve" | "reject") => {
    setStatusModal({
      open: true,
      type,
      delivererId: deliverer._id,
      delivererName: deliverer.fullName,
      currentReason: deliverer.reason || "",
    });
    setModalReason(deliverer.reason || "");
  };

  const closeStatusModal = () => {
    setStatusModal({
      open: false,
      type: null,
      delivererId: null,
      delivererName: "",
      currentReason: "",
    });
    setModalReason("");
  };

  const handleStatusChange = async () => {
    if (!statusModal.delivererId || !statusModal.type) return;

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
        response = await adminService.approveDeliverer(statusModal.delivererId);
      } else {
        response = await adminService.rejectDeliverer(statusModal.delivererId, modalReason);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Deliverer ${statusModal.type === "approve" ? "approved" : "rejected"} successfully`,
        });
        closeStatusModal();
        loadDeliverers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${statusModal.type} deliverer`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Deliverers</h1>
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
                {deliverers.map((deliverer, index) => (
                  <TableRow key={deliverer._id || `deliverer-${index}`}>
                    <TableCell className="font-medium">{deliverer.fullName}</TableCell>
                    <TableCell>{deliverer.userId?.email || deliverer.user?.email || "N/A"}</TableCell>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{deliverer.reason || "-"}</span>
                        {deliverer.reason && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => openStatusModal(deliverer, "reject")}
                            title="Edit reason"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {deliverer.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openStatusModal(deliverer, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openStatusModal(deliverer, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {deliverer.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(deliverer, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        {deliverer.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(deliverer, "approve")}
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
              {statusModal.type === "approve" ? "Approve Deliverer" : "Reject Deliverer"}
            </DialogTitle>
            <DialogDescription>
              {statusModal.type === "approve" 
                ? `Are you sure you want to approve "${statusModal.delivererName}"?`
                : `Are you sure you want to reject "${statusModal.delivererName}"? Please provide a reason below.`}
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


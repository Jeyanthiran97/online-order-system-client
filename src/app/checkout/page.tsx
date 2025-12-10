"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import AddressList from "@/components/checkout/AddressList";
import AddressForm from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await userService.getAddresses();
      setAddresses(data);
      
      // Auto-select default address
      const defaultAddr = data.find((addr: any) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0]._id);
      } else {
        // If no addresses, show form
        setShowForm(true);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (data: any) => {
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress._id, data);
        toast({ title: "Success", description: "Address updated successfully" });
      } else {
        await userService.addAddress(data);
        toast({ title: "Success", description: "Address added successfully" });
      }
      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error("Failed to save address:", error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const handleProceed = () => {
    if (!selectedAddressId) {
      toast({
        title: "Select Address",
        description: "Please select a shipping address to proceed",
        variant: "destructive",
      });
      return;
    }
    router.push(`/checkout/payment?addressId=${selectedAddressId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <LoadingSpinner size="lg" text="Loading addresses..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <span className="font-semibold text-primary">Shipping</span>
              <ArrowRight className="h-4 w-4" />
              <span>Payment</span>
              <ArrowRight className="h-4 w-4" />
              <span>Confirmation</span>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Shipping Address</CardTitle>
              {!showForm && addresses.length > 0 && (
                <Button onClick={() => { setShowForm(true); setEditingAddress(null); }} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showForm ? (
                <AddressForm
                  initialData={editingAddress}
                  onSubmit={handleAddressSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                    // If no addresses exist and user cancels, they are stuck. 
                    // But fetchAddresses handles showing form if empty.
                  }}
                />
              ) : (
                <>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No addresses found.</p>
                      <Button onClick={() => setShowForm(true)}>Add Address</Button>
                    </div>
                  ) : (
                    <AddressList
                      addresses={addresses}
                      selectedAddressId={selectedAddressId}
                      onSelect={setSelectedAddressId}
                      onRefresh={fetchAddresses}
                      onEdit={(addr) => {
                        setEditingAddress(addr);
                        setShowForm(true);
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {!showForm && addresses.length > 0 && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => router.push("/cart")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
              <Button onClick={handleProceed} size="lg">
                Proceed to Payment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

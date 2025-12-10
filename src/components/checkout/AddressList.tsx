"use client";

import { useState } from "react";
import { userService } from "@/services/user.service";

interface AddressListProps {
  addresses: any[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
  onRefresh: () => void;
  onEdit: (address: any) => void;
}

export default function AddressList({
  addresses,
  selectedAddressId,
  onSelect,
  onRefresh,
  onEdit,
}: AddressListProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      setLoading(true);
      await userService.deleteAddress(id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await userService.setDefaultAddress(id);
      onRefresh();
    } catch (error) {
      console.error("Failed to set default address:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <div
          key={address._id}
          className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
            selectedAddressId === address._id
              ? "border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
          onClick={() => onSelect(address._id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {address.fullName}
                </h3>
                {address.isDefault && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {address.streetAddress}
              </p>
              <p className="text-sm text-gray-500">
                {address.city}, {address.district}
              </p>
              <p className="text-sm text-gray-500">{address.postalCode}</p>
              <p className="text-sm text-gray-500">{address.country}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2 border-t pt-2">
            {!address.isDefault && (
              <button
                onClick={(e) => handleSetDefault(address._id, e)}
                disabled={loading}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Set Default
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              disabled={loading}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(address._id);
              }}
              disabled={loading}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

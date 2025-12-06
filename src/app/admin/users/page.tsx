"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        ...(roleFilter && { role: roleFilter }),
        sort: "-createdAt",
      });
      if (response.success) {
        // API returns data in format: [{ user: {...}, profile: {...} }]
        // Extract the user objects and map id to _id for consistency
        const rawData = response.data || [];
        
        const usersData = rawData.map((item: any) => {
          // Handle nested user structure from API
          const userObj = item.user || item;
          return {
            _id: userObj.id || userObj._id,
            email: userObj.email || "",
            role: userObj.role || "customer",
            isActive: userObj.isActive !== undefined ? userObj.isActive : true,
            createdAt: userObj.createdAt || new Date().toISOString(),
            updatedAt: userObj.updatedAt || new Date().toISOString(),
          };
        });
        
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="deliverer">Deliverer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user._id || `user-${index}`}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
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


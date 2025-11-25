"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productService, Product } from "@/services/productService";
import { adminService, Seller } from "@/services/adminService";
import { categoryService, Category } from "@/services/categoryService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sellerFilter, setSellerFilter] = useState<string>("");

  useEffect(() => {
    loadSellers();
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, sellerFilter]);

  const loadSellers = async () => {
    try {
      const response = await adminService.getSellers({ status: "approved" });
      if (response.success) {
        setSellers(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load sellers", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        ...(categoryFilter && { category: categoryFilter }),
        ...(sellerFilter && { sellerId: sellerFilter }),
        sort: "-updatedAt",
      });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-4">
          <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter((category) => category.name && category.name.trim() !== "")
                .map((category) => {
                  const categoryValue = category.name?.trim() || "";
                  if (!categoryValue) return null;
                  return (
                    <SelectItem key={category._id} value={categoryValue}>
                      {categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1)}
                    </SelectItem>
                  );
                })
                .filter(Boolean)}
            </SelectContent>
          </Select>
          <Select value={sellerFilter || "all"} onValueChange={(value) => setSellerFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by seller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sellers</SelectItem>
              {sellers
                .filter((seller) => {
                  const id = seller._id;
                  return id && String(id).trim() !== "";
                })
                .map((seller) => (
                  <SelectItem key={seller._id} value={String(seller._id)}>
                    {seller.shopName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product._id || `product-${index}`}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.seller?.shopName || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
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


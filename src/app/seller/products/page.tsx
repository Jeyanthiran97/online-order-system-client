"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productService, Product } from "@/services/productService";
import { categoryService, Category } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Star } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { productFormSchema, type ProductFormData } from "@/lib/validations";
import {
  getErrorMessage,
  isCommonError,
  mapServerErrorsToFields,
} from "@/lib/errorHandler";

interface ImagePreview {
  file?: File;
  url: string;
  originalPath?: string; // Store original path for existing images
  isExisting?: boolean;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    },
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

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
      const response = await productService.getProducts({ sort: "-updatedAt" });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const totalImages = imagePreviews.length + newPreviews.length;
    if (totalImages > 5) {
      toast({
        title: "Error",
        description:
          "Maximum 5 images allowed. Please remove some images first.",
        variant: "destructive",
      });
      return;
    }

    setImagePreviews([...imagePreviews, ...newPreviews]);
    e.target.value = ""; // Reset input
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    // Adjust main image index if needed
    if (mainImageIndex >= newPreviews.length && newPreviews.length > 0) {
      setMainImageIndex(newPreviews.length - 1);
    } else if (newPreviews.length === 0) {
      setMainImageIndex(0);
    }
  };

  const setMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Get new image files
      const newImageFiles = imagePreviews
        .filter((preview) => preview.file)
        .map((preview) => preview.file!);

      // Get existing image paths (for updates) - use originalPath if available, otherwise extract from URL
      const existingImageUrls = imagePreviews
        .filter((preview) => preview.isExisting)
        .map((preview) => {
          if (preview.originalPath) return preview.originalPath;
          // Extract path from full URL if originalPath not available
          const url = preview.url;
          if (url.startsWith("http")) {
            const match = url.match(/\/uploads\/.*$/);
            return match ? match[0] : url;
          }
          return url;
        });

      // Transform form data (strings) to API format (numbers)
      const apiData = {
        name: data.name,
        description: data.description,
        price:
          typeof data.price === "string" ? parseFloat(data.price) : data.price,
        stock:
          typeof data.stock === "string"
            ? parseInt(data.stock, 10)
            : data.stock,
        category: data.category,
        images: newImageFiles,
        mainImageIndex: mainImageIndex,
        ...(editingProduct &&
          existingImageUrls.length > 0 && {
            existingImages: existingImageUrls,
          }),
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, apiData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await productService.createProduct(apiData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setShowForm(false);
      setEditingProduct(null);
      setImagePreviews([]);
      setMainImageIndex(0);
      reset();
      loadProducts();
    } catch (error: unknown) {
      // Try to map server errors to form fields
      const hasFieldErrors = mapServerErrorsToFields(error, setError, {
        name: "name",
        description: "description",
        price: "price",
        stock: "stock",
        category: "category",
      });

      // If it's a common error or couldn't map to fields, show as toast
      if (isCommonError(error) || !hasFieldErrors) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });

    // Load existing images
    if (product.images && product.images.length > 0) {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const existingPreviews: ImagePreview[] = product.images.map((img) => {
        const originalPath = img.startsWith("http") ? img : img;
        const displayUrl = img.startsWith("http")
          ? img
          : `${API_URL.replace("/api", "")}${img}`;
        return {
          url: displayUrl,
          originalPath: originalPath,
          isExisting: true,
        };
      });
      setImagePreviews(existingPreviews);
      setMainImageIndex(product.mainImageIndex || 0);
    } else {
      setImagePreviews([]);
      setMainImageIndex(0);
    }

    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productService.deleteProduct(id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      loadProducts();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setImagePreviews([]);
    setMainImageIndex(0);
    reset();
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  <FormError>{errors.name?.message}</FormError>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="category"
                            className={errors.category ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories
                              .filter(
                                (category) =>
                                  category.name && category.name.trim() !== ""
                              )
                              .map((category) => {
                                const categoryValue = (
                                  category.name?.trim() ||
                                  category._id ||
                                  `category-${category._id}`
                                ).trim();
                                if (!categoryValue || categoryValue === "")
                                  return null;
                                return (
                                  <SelectItem
                                    key={category._id}
                                    value={categoryValue}
                                  >
                                    {categoryValue.charAt(0).toUpperCase() +
                                      categoryValue.slice(1)}
                                  </SelectItem>
                                );
                              })
                              .filter(Boolean)}
                          </SelectContent>
                        </Select>
                        <FormError>{errors.category?.message}</FormError>
                      </>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register("description")}
                  className={errors.description ? "border-red-500" : ""}
                />
                <FormError>{errors.description?.message}</FormError>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  <FormError>{errors.price?.message}</FormError>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock")}
                    className={errors.stock ? "border-red-500" : ""}
                  />
                  <FormError>{errors.stock?.message}</FormError>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Product Images (Max 5)</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={imagePreviews.length >= 5}
                      className="cursor-pointer"
                    />
                    {imagePreviews.length >= 5 && (
                      <span className="text-sm text-muted-foreground">
                        Maximum 5 images
                      </span>
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div
                            className="relative aspect-square border-2 rounded-lg overflow-hidden"
                            style={{
                              borderColor:
                                mainImageIndex === index
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--border))",
                            }}
                          >
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {mainImageIndex === index && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Star className="h-4 w-4 fill-current" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setMainImage(index)}
                                className="h-8"
                              >
                                Set Main
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="h-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {mainImageIndex === index && (
                            <p className="text-xs text-center mt-1 text-primary font-medium">
                              Main Image
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length === 0 && (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No images selected</p>
                      <p className="text-sm">Upload up to 5 product images</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingProduct
                      ? "Updating..."
                      : "Creating..."
                    : editingProduct
                    ? "Update"
                    : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {product.category}
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

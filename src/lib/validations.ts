import { z } from "zod";

// Login validation (no minimum length for password - only required)
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Customer registration validation
export const customerRegisterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters"),
});

export type CustomerRegisterFormData = z.infer<typeof customerRegisterSchema>;

// Seller registration validation
export const sellerRegisterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  shopName: z
    .string()
    .min(1, "Shop name is required")
    .min(2, "Shop name must be at least 2 characters"),
});

export type SellerRegisterFormData = z.infer<typeof sellerRegisterSchema>;

// Deliverer registration validation
export const delivererRegisterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  licenseNumber: z
    .string()
    .min(1, "License number is required")
    .min(5, "License number must be at least 5 characters"),
  NIC: z
    .string()
    .min(1, "NIC is required")
    .min(8, "NIC must be at least 8 characters"),
});

export type DelivererRegisterFormData = z.infer<typeof delivererRegisterSchema>;

// Product validation (for form inputs - accepts strings that convert to numbers)
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .pipe(
      z
        .number({ required_error: "Price is required", invalid_type_error: "Price must be a valid number" })
        .min(0, "Price must be greater than or equal to 0")
        .positive("Price must be greater than 0")
    ),
  stock: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(
      z
        .number({ required_error: "Stock is required", invalid_type_error: "Stock must be a valid number" })
        .int("Stock must be a whole number")
        .min(0, "Stock must be greater than or equal to 0")
    ),
  category: z
    .string()
    .min(1, "Category is required"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Category validation
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Category name can only contain letters, numbers, spaces, and hyphens"),
  description: z
    .string()
    .optional(),
  isActive: z
    .boolean()
    .default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;


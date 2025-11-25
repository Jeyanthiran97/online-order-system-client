"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/use-toast";
import { customerRegisterSchema, type CustomerRegisterFormData } from "@/lib/validations";
import { getErrorMessage, isCommonError, mapServerErrorsToFields } from "@/lib/errorHandler";

export default function SignupPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data: CustomerRegisterFormData) => {
    try {
      const response = await authService.registerCustomer(data);
      if (response.success) {
        await login(response.data.token, response.data.user);
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        router.push("/");
      }
    } catch (error: unknown) {
      // Try to map server errors to form fields
      const hasFieldErrors = mapServerErrorsToFields(error, setError, {
        email: "email",
        password: "password",
        fullName: "fullName",
        phone: "phone",
        address: "address",
      });

      // If it's a common error or couldn't map to fields, show as toast
      if (isCommonError(error) || !hasFieldErrors) {
        toast({
          title: "Registration Failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up as a customer</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                className={errors.fullName ? "border-red-500" : ""}
              />
              <FormError>{errors.fullName?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              <FormError>{errors.email?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              <FormError>{errors.phone?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, Country"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
              <FormError>{errors.address?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              <FormError>{errors.password?.message}</FormError>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}



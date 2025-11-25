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
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { getErrorMessage, isCommonError, mapServerErrorsToFields } from "@/lib/errorHandler";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    // Don't reset form on error
    shouldUnregister: false,
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      if (response.success) {
        await login(response.data.token, response.data.user);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        router.push("/");
      }
    } catch (error: unknown) {
      // Try to map server errors to form fields first
      const hasFieldErrors = mapServerErrorsToFields(error, setError, {
        email: "email",
        password: "password",
      });

      // Get error message for toast if needed
      const errorMessage = getErrorMessage(error);
      const isApprovalError = 
        errorMessage.includes("pending approval") ||
        errorMessage.includes("not approved") ||
        errorMessage.includes("rejected") ||
        errorMessage.includes("approval") ||
        errorMessage.includes("inactive");

      // If we have field errors, still show toast for credential errors (but don't auto-hide)
      // For other errors (approval errors, etc.), show as toast that doesn't auto-hide
      if (hasFieldErrors) {
        // If it's a credential error, show toast that doesn't auto-hide
        if (errorMessage.includes("Invalid email or password") || 
            errorMessage.includes("No account found") || 
            errorMessage.includes("Incorrect password")) {
          toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
            duration: Infinity, // Don't auto-hide - wait for user to close
          });
        }
        return;
      }

      // For other errors (approval errors, network errors, etc.), show as toast that doesn't auto-hide
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
        duration: Infinity, // Don't auto-hide - wait for user to close
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

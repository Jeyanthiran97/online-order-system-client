"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/use-toast";
import { designSystem } from "@/lib/design-system";
import { Navbar } from "@/components/layouts/Navbar";
import { SimpleFooter } from "@/components/layouts/SimpleFooter";
import { Store, Mail, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { sellerRegisterSchema, type SellerRegisterFormData } from "@/lib/validations";
import { getErrorMessage, mapServerErrorsToFields } from "@/lib/errorHandler";

export default function SellerRegisterPage() {
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SellerRegisterFormData>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      shopName: "",
    },
  });

  const onSubmit = async (data: SellerRegisterFormData) => {
    try {
      const response = await authService.registerSeller(data);
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Registration submitted. Waiting for admin approval.",
        });
        router.push("/auth/login");
      }
    } catch (error: unknown) {
      // Map server errors to form fields
      mapServerErrorsToFields(error, setError, {
        email: "email",
        password: "password",
        shopName: "shopName",
      });

      // Show toast for errors that couldn't be mapped to fields
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Register Form Section */}
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-fade-in">
          <Card className={`${designSystem.card.base} ${designSystem.card.hover} border-2 shadow-xl`}>
            <CardHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className={`${designSystem.typography.h2} text-center`}>
                Become a Seller
              </CardTitle>
              <CardDescription className={`${designSystem.typography.body} text-base`}>
                Register your shop and start selling. Admin approval required.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="shopName" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                    <Store className="h-4 w-4" />
                    Shop Name
                  </Label>
                  <Input
                    id="shopName"
                    placeholder="My Awesome Shop"
                    {...register("shopName")}
                    className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                      errors.shopName ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  <FormError>{errors.shopName?.message}</FormError>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                      errors.email ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  <FormError>{errors.email?.message}</FormError>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    {...register("password")}
                    className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                      errors.password ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  <FormError>{errors.password?.message}</FormError>
                </div>
                
                <div className={`${designSystem.card.base} p-4 bg-primary/5 border-primary/20`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={`${designSystem.typography.small} font-semibold mb-1`}>
                        Approval Process
                      </p>
                      <p className={`${designSystem.typography.small} ${designSystem.typography.muted}`}>
                        Your registration will be reviewed by an admin. You'll be notified once approved.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button 
                  type="submit" 
                  className={`w-full h-11 ${designSystem.button.base} ${designSystem.button.hover} shadow-md`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Register as Seller
                    </span>
                  )}
                </Button>
                
                <div className={`text-center ${designSystem.typography.small} ${designSystem.typography.muted} pt-2`}>
                  Already have an account?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-primary hover:underline font-semibold transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}





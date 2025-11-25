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
import { designSystem } from "@/lib/design-system";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { UserPlus, Mail, Lock, User, Phone, MapPin, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Signup Form Section */}
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg animate-fade-in">
          <Card className={`${designSystem.card.base} ${designSystem.card.hover} border-2 shadow-xl`}>
            <CardHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className={`${designSystem.typography.h2} text-center`}>
                Create Your Account
              </CardTitle>
              <CardDescription className={`${designSystem.typography.body} text-base`}>
                Join thousands of happy customers and start shopping today
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                    className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                      errors.fullName ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  <FormError>{errors.fullName?.message}</FormError>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      {...register("phone")}
                      className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                        errors.phone ? "border-destructive focus:border-destructive" : ""
                      }`}
                    />
                    <FormError>{errors.phone?.message}</FormError>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      {...register("password")}
                      className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                        errors.password ? "border-destructive focus:border-destructive" : ""
                      }`}
                    />
                    <FormError>{errors.password?.message}</FormError>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className={`${designSystem.typography.small} font-semibold flex items-center gap-2`}>
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, Country"
                    {...register("address")}
                    className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                      errors.address ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  <FormError>{errors.address?.message}</FormError>
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
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </span>
                  )}
                </Button>
                
                <div className={`text-center ${designSystem.typography.small} ${designSystem.typography.muted} pt-2`}>
                  Already have an account?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-primary hover:underline font-semibold transition-colors duration-200"
                  >
                    Sign in instead
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}



"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/use-toast";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { getErrorMessage, isCommonError, mapServerErrorsToFields } from "@/lib/errorHandler";
import { designSystem } from "@/lib/design-system";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { HeroSection } from "@/components/ui/hero-section";
import { LogIn, Mail, Lock, ShoppingBag, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    shouldUnregister: false,
    shouldFocusError: true,
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      if (response.success) {
        await login(response.data.token, response.data.user);
        toast({
          title: "Success",
          description: "Logged in successfully",
          variant: "success",
        });
        router.push("/");
      }
    } catch (error: unknown) {
      // Map server errors to form fields
      mapServerErrorsToFields(error, setError, {
        email: "email",
        password: "password",
      });

      // Get error message for toast
      const errorMessage = getErrorMessage(error);
      
      // Clear form fields immediately on login error
      reset({
        email: "",
        password: "",
      });
      
      // Show toast for login errors - auto-dismisses after 5 seconds
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <HeroSection className="h-32" />

      {/* Login Form Section */}
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-fade-in">
          <Card className={`${designSystem.card.base} ${designSystem.card.hover} border-2 shadow-xl`}>
            <CardHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className={`${designSystem.typography.h2} text-center`}>
                Welcome Back
              </CardTitle>
              <CardDescription className={`${designSystem.typography.body} text-base`}>
                Sign in to your account to continue shopping
              </CardDescription>
            </CardHeader>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return handleSubmit(onSubmit)(e);
              }}
              noValidate
            >
              <CardContent className="space-y-5">
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
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`h-11 shadow-sm border-2 focus:border-primary transition-colors ${
                      errors.password ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  <FormError>{errors.password?.message}</FormError>
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
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </span>
                  )}
                </Button>
                
                <div className={`text-center ${designSystem.typography.small} ${designSystem.typography.muted} pt-2`}>
                  Don't have an account?{" "}
                  <Link 
                    href="/auth/signup" 
                    className="text-primary hover:underline font-semibold transition-colors duration-200"
                  >
                    Create one now
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

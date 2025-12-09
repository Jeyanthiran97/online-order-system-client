"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/use-toast";
import {
  loginSchema,
  customerRegisterSchema,
  type LoginFormData,
  type CustomerRegisterFormData,
} from "@/lib/validations";
import {
  getErrorMessage,
  isCommonError,
  mapServerErrorsToFields,
} from "@/lib/errorHandler";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "signup";
  skipRedirect?: boolean;
  redirectAfterLogin?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "login",
  skipRedirect = false,
  redirectAfterLogin,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const { login } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  // Reset mode when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setError: setErrorLogin,
    reset: resetLogin,
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    setError: setErrorSignup,
    formState: { errors: errorsSignup, isSubmitting: isSubmittingSignup },
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

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      if (response.success) {
        resetLogin();
        onOpenChange(false);
        // The login function in AuthContext handles navigation
        // Pass skipRedirect to stay on current page if needed
        // Pass redirectAfterLogin to redirect to specific page after login
        await login(response.data.token, response.data.user, skipRedirect, redirectAfterLogin);
        // Refresh cart to process pending items
        if (response.data.user.role === "customer") {
          await refreshCart();
        }
        if (!skipRedirect) {
          toast({
            title: "Success",
            description: "Logged in successfully",
            variant: "success",
          });
        }
      }
    } catch (error: unknown) {
      mapServerErrorsToFields(error, setErrorLogin, {
        email: "email",
        password: "password",
      });

      const errorMessage = getErrorMessage(error);
      resetLogin({
        email: "",
        password: "",
      });

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const onSignupSubmit = async (data: CustomerRegisterFormData) => {
    try {
      const response = await authService.registerCustomer(data);
      if (response.success) {
        // Check if token is returned (auto-login)
        if (response.data?.token) {
          // Auto-login if token is provided
          // Pass skipRedirect to stay on current page if needed
          // Pass redirectAfterLogin to redirect to specific page after login
          await login(response.data.token, response.data.user, skipRedirect, redirectAfterLogin);
          // Refresh cart to process pending items
          if (response.data.user.role === "customer") {
            await refreshCart();
          }
          if (!skipRedirect) {
            toast({
              title: "Success",
              description: "Account created and logged in successfully",
              variant: "success",
            });
          }
          onOpenChange(false);
          if (!skipRedirect) {
            router.refresh();
          }
        } else {
          // No token, switch to login mode
          toast({
            title: "Success",
            description: "Account created successfully. Please login.",
            variant: "success",
          });
          setMode("login");
          resetLogin({
            email: data.email,
            password: "",
          });
        }
      }
    } catch (error: unknown) {
      const hasFieldErrors = mapServerErrorsToFields(error, setErrorSignup, {
        email: "email",
        password: "password",
        fullName: "fullName",
        phone: "phone",
        address: "address",
      });

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Login" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Enter your credentials to access your account"
              : "Sign up as a customer"}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return handleSubmitLogin(onLoginSubmit)(e);
            }}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                {...registerLogin("email")}
                className={errorsLogin.email ? "border-red-500" : ""}
              />
              <FormError>{errorsLogin.email?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                {...registerLogin("password")}
                className={errorsLogin.password ? "border-red-500" : ""}
              />
              <FormError>{errorsLogin.password?.message}</FormError>
            </div>
            <div className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmittingLogin}>
                {isSubmittingLogin ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitSignup(onSignupSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="signup-fullName">Full Name</Label>
              <Input
                id="signup-fullName"
                {...registerSignup("fullName")}
                className={errorsSignup.fullName ? "border-red-500" : ""}
              />
              <FormError>{errorsSignup.fullName?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                {...registerSignup("email")}
                className={errorsSignup.email ? "border-red-500" : ""}
              />
              <FormError>{errorsSignup.email?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-phone">Phone</Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="+1234567890"
                {...registerSignup("phone")}
                className={errorsSignup.phone ? "border-red-500" : ""}
              />
              <FormError>{errorsSignup.phone?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-address">Address</Label>
              <Input
                id="signup-address"
                placeholder="123 Main St, City, Country"
                {...registerSignup("address")}
                className={errorsSignup.address ? "border-red-500" : ""}
              />
              <FormError>{errorsSignup.address?.message}</FormError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                {...registerSignup("password")}
                className={errorsSignup.password ? "border-red-500" : ""}
              />
              <FormError>{errorsSignup.password?.message}</FormError>
            </div>
            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmittingSignup}
              >
                {isSubmittingSignup ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


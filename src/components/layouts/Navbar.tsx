"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, ShoppingBag, Menu, X } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { designSystem } from "@/lib/design-system";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleOpenSignup = () => {
    setAuthModalMode("signup");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border" 
          : "bg-background border-b border-border shadow-sm"
      }`}
    >
      <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding}`}>
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link 
            href="/" 
            className={`flex items-center gap-2 ${designSystem.typography.h3} text-primary hover:opacity-80 transition-opacity duration-200`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Online Store</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Cart - Always visible */}
            <Link href={isAuthenticated && user?.role === "customer" ? "/cart" : "/auth/login"}>
              <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-colors relative">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link href="/seller/register">
                  <Button variant="ghost" className={`hover:bg-primary/10 hover:text-primary ${designSystem.button.base}`}>
                    Become a Seller
                  </Button>
                </Link>
                <Link href="/deliverer/register">
                  <Button variant="ghost" className={`hover:bg-primary/10 hover:text-primary ${designSystem.button.base}`}>
                    Join as Deliverer
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleOpenSignup} className={`${designSystem.button.base} ${designSystem.button.hover}`}>
                  Signup
                </Button>
                <Button onClick={handleOpenLogin} className={`${designSystem.button.base} ${designSystem.button.hover}`}>
                  Signin
                </Button>
              </>
            ) : (
              <>
                {user?.role === "customer" && (
                  <>
                    <Link href="/customer">
                      <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-colors">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/customer/orders">
                      <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-colors">
                        Orders
                      </Button>
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                  <span className={`${designSystem.typography.small} font-medium text-foreground max-w-[150px] truncate`}>
                    {user?.email}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className={`h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors ${designSystem.button.base}`}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            {/* Cart - Always visible */}
            <Link href={isAuthenticated && user?.role === "customer" ? "/cart" : "/auth/login"} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start relative">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link href="/seller/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Become a Seller
                  </Button>
                </Link>
                <Link href="/deliverer/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Join as Deliverer
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleOpenSignup} className="w-full">
                  Signup
                </Button>
                <Button onClick={handleOpenLogin} className="w-full">
                  Signin
                </Button>
              </>
            ) : (
              <>
                {user?.role === "customer" && (
                  <>
                    <Link href="/customer" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/customer/orders" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Orders
                      </Button>
                    </Link>
                  </>
                )}
                <div className="px-3 py-2 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">{user?.email}</p>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        initialMode={authModalMode}
      />
    </nav>
  );
}





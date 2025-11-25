"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Online Store
          </Link>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/seller/register">
                  <Button variant="ghost">Become a Seller</Button>
                </Link>
                <Link href="/deliverer/register">
                  <Button variant="ghost">Join as Deliverer</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline">Signup</Button>
                </Link>
                <Link href="/auth/login">
                  <Button>Signin</Button>
                </Link>
              </>
            ) : (
              <>
                {user?.role === "customer" && (
                  <>
                    <Link href="/customer">
                      <Button variant="ghost">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/customer/orders">
                      <Button variant="ghost">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Orders
                      </Button>
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}



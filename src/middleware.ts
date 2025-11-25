import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/seller/register", "/deliverer/register", "/products"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  
  // If accessing public route and authenticated, check if user should be redirected
  if (isPublicRoute && token && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const role = user.role;
      
      // Redirect sellers, deliverers, and admins away from public routes
      if (role === "seller") {
        return NextResponse.redirect(new URL("/seller", request.url));
      }
      if (role === "deliverer") {
        return NextResponse.redirect(new URL("/deliverer", request.url));
      }
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      // Customers can access public routes
    } catch {
      // Invalid user cookie, allow access
    }
  }
  
  // Allow public routes for unauthenticated users or customers
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token || !userCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  let user;
  try {
    user = JSON.parse(userCookie);
  } catch {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Role-based access control
  const role = user.role;

  // Customer routes
  if (pathname.startsWith("/customer")) {
    if (role !== "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Seller routes
  if (pathname.startsWith("/seller")) {
    if (role !== "seller") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Check approval status
    if (user.profile?.status !== "approved") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Deliverer routes
  if (pathname.startsWith("/deliverer")) {
    if (role !== "deliverer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Check approval status
    if (user.profile?.status !== "approved") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/products/:path*",
    "/customer/:path*",
    "/seller/:path*",
    "/deliverer/:path*",
    "/admin/:path*",
  ],
};


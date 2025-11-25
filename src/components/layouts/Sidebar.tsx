"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Package, ShoppingCart, Truck, Users, BarChart3, Settings, FolderTree } from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sellerItems: SidebarItem[] = [
  { title: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { title: "Products", href: "/seller/products", icon: Package },
  { title: "Orders", href: "/seller/orders", icon: ShoppingCart },
];

const delivererItems: SidebarItem[] = [
  { title: "Dashboard", href: "/deliverer", icon: LayoutDashboard },
  { title: "Deliveries", href: "/deliverer/deliveries", icon: Truck },
];

const adminItems: SidebarItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Sellers", href: "/admin/sellers", icon: Package },
  { title: "Deliverers", href: "/admin/deliverers", icon: Truck },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getItems = (): SidebarItem[] => {
    if (user?.role === "seller") return sellerItems;
    if (user?.role === "deliverer") return delivererItems;
    if (user?.role === "admin") return adminItems;
    return [];
  };

  const items = getItems();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold text-primary">
          Online Store
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-2 px-3 text-sm text-muted-foreground">
          {user?.email}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}



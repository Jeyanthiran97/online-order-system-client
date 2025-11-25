"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layouts/Sidebar";

export default function DelivererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/deliverer/register";

  // Don't show sidebar on register page
  if (isRegisterPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}





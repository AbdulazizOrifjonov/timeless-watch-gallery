"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavProvider } from "@/components/admin/AdminNavContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminNavProvider>
        <div className="flex bg-navy-50 min-h-screen">
          <AdminSidebar />
          <main className="flex-1 w-full lg:ml-0 min-w-0">{children}</main>
        </div>
      </AdminNavProvider>
    </AdminGuard>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Heart,
  Images,
  Newspaper,
  Tag,
  Ticket,
  ShoppingCart,
  Users,
  ShieldCheck,
  Settings,
  ExternalLink,
  X,
} from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { cn } from "@/lib/utils";
import { useAdminNav } from "@/components/admin/AdminNavContext";

const NAV = [
  { href: "/admin", label: "Boshqaruv paneli", icon: LayoutDashboard },
  { href: "/admin/products", label: "Mahsulotlar", icon: Package },
  { href: "/admin/categories", label: "Kategoriyalar", icon: Tag },
  { href: "/admin/promocodes", label: "Promokodlar", icon: Ticket },
  { href: "/admin/sliders", label: "Sliderlar", icon: Images },
  { href: "/admin/news", label: "Yangiliklar & Reklama", icon: Newspaper },

  { href: "/admin/orders", label: "Buyurtmalar", icon: ShoppingCart },
  { href: "/admin/customers", label: "Mijozlar", icon: Users },
  { href: "/admin/admins", label: "Adminlar", icon: ShieldCheck },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useAdminNav();

  return (
    <>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col overflow-y-auto bg-navy-950 p-4 text-white admin-sidebar-width transition-transform duration-300 ease-in-out",
          mobileOpen && "open"
        )}
      >
        <div className="flex items-center justify-between mb-6 shrink-0 px-2 pt-2">
          <Logo dark />
          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-navy-800 hover:text-white transition touch-target"
            onClick={() => setMobileOpen(false)}
            aria-label="Menyuni yopish"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition touch-target",
                  active ? "bg-navy-800 text-white" : "text-white/60 hover:bg-navy-900 hover:text-white"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 text-sm font-medium text-white hover:bg-white/5 touch-target"
        >
          Saytga o'tish <ExternalLink size={14} />
        </Link>

        <div className="rounded-xl bg-navy-900 p-4 text-xs text-white/60">
          <p className="mb-1 font-serif text-sm italic text-white">&ldquo;Timeless — The Watch Gallery — Professional asboblar do'koni.&rdquo;</p>
          <p>Timeless — The Watch Gallery</p>
        </div>
        <p className="mt-3 text-center text-[11px] text-white/30">v1.0.0 © 2025</p>
      </aside>
    </>
  );
}

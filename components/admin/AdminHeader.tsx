"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAdminNav } from "@/components/admin/AdminNavContext";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  moderator: "Moderator",
  content_admin: "Kontent admin",
  customer: "Mijoz",
};

export function AdminHeader({
  title,
  subtitle,
  searchPlaceholder = "Qidirish...",
}: {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
}) {
  const { user } = useAuth();
  const { setMobileOpen } = useAdminNav();

  return (
    <header className="sticky top-0 z-30 flex h-[72px] sm:h-[76px] items-center gap-3 sm:gap-4 border-b border-navy-100 bg-white/95 backdrop-blur-md px-3 sm:px-4 lg:px-6">
      {/* Mobil menyu ochish tugmasi */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white shadow-xs hover:bg-navy-800 active:scale-95 transition touch-target"
        aria-label="Admin menyusini ochish"
      >
        <Menu size={20} />
      </button>

      {/* Sarlavha va Tavsif */}
      <div className="flex-1 min-w-0">
        <h1 className="truncate font-bold text-navy-950 text-sm sm:text-base leading-snug">
          {title}
        </h1>
        <p className="truncate text-[11px] sm:text-xs text-navy-900/50 mt-0.5">
          {subtitle ?? "Do'koningizni boshqaring va rivojlantiring"}
        </p>
      </div>

      {/* Qidiruv (Katta ekranlarda) */}
      <div className="hidden md:flex max-w-sm flex-1 items-center gap-2 rounded-full bg-navy-50 px-4 py-2.5">
        <Search size={16} className="text-navy-900/40" />
        <input
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-navy-900/40"
        />
      </div>

      {/* Bildirishnomalar */}
      <button
        type="button"
        className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-navy-700 hover:bg-navy-50 transition touch-target"
        aria-label="Bildirishnomalar"
      >
        <Bell size={19} />
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-xs">
          5
        </span>
      </button>

      {/* Profil va Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-navy-900 text-sm font-bold text-white shadow-xs">
          {user?.fullName?.slice(0, 1) ?? "A"}
        </div>
        <div className="hidden md:block text-sm">
          <p className="font-semibold text-navy-900 text-xs sm:text-sm leading-snug">
            {user?.fullName ?? "Admin"}
          </p>
          <p className="text-[11px] text-navy-900/50">
            {ROLE_LABEL[user?.role ?? "super_admin"]}
          </p>
        </div>
      </div>
    </header>
  );
}
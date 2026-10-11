"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CreditCard,
  HelpCircle,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/profile", label: "Asosiy ma'lumotlar", icon: User },
  { href: "/orders", label: "Buyurtmalar", icon: Package },
  { href: "/wishlist", label: "Sevimlilar", icon: Heart },
  { href: "/profile?tab=address", label: "Manzillar", icon: MapPin },
  { href: "/profile?tab=payment", label: "To'lov usullari", icon: CreditCard },
  { href: "/profile?tab=notifications", label: "Bildirishnomalar", icon: Bell },
  { href: "/profile?tab=settings", label: "Sozlamalar", icon: Settings },
  { href: "/profile?tab=help", label: "Yordam", icon: HelpCircle },
];

export function AccountSidebar() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const renderNav = [...NAV];
  if (isAdmin) {
    renderNav.splice(1, 0, { href: "/admin", label: "Admin Panelga o'tish", icon: LayoutDashboard });
  }
  const currentTab = searchParams.get("tab");
  const currentPathWithTab = currentTab ? `${pathname}?tab=${currentTab}` : pathname;

  const activeItem = renderNav.find((n) => n.href === currentPathWithTab) || renderNav[0];

  return (
    <aside className="hidden lg:block lg:sticky lg:top-[76px] lg:h-[calc(100vh-76px)] lg:overflow-y-auto custom-scrollbar pb-8 relative z-20">
      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 transition-all">
        {renderNav.map((item) => {
          const isActive = activeItem?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition touch-target",
                isActive
                  ? "bg-navy-900 text-white shadow-md"
                  : "text-navy-900 hover:bg-navy-50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition touch-target"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </nav>

      {/* Quote Card */}
      <div className="hidden lg:block mt-8 rounded-xl bg-navy-900 p-6 text-white shadow-lg">
        <p className="mb-4 font-serif text-lg font-medium italic leading-snug text-gold-500">
          "Ishingiz unumli va asboblaringiz mustahkam bo'lsin!"
        </p>
        <p className="text-xs font-bold tracking-widest text-white/50 uppercase">
          Timeless — The Watch Gallery
        </p>
      </div>
    </aside>
  );
}



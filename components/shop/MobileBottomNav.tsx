"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, ShoppingCart, LayoutGrid, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { user } = useAuth();
  const isAuthed = !!user;

  if (pathname?.startsWith("/admin")) return null;

  const navItems = [
    { href: "/", label: "Asosiy", icon: Home },
    { href: "/products", label: "Katalog", icon: LayoutGrid },
    { href: "/wishlist", label: "Sevimlilar", icon: Heart, badge: ids.length },
    { href: "/cart", label: "Savatcha", icon: ShoppingCart, badge: itemCount },
    { href: isAuthed ? "/profile" : "/login", label: isAuthed ? "Profil" : "Kirish", icon: User },
  ];

  return (
    <nav
      aria-label="Mobil navigatsiya"
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-navy-100/80 bg-white/95 backdrop-blur-xl md:hidden shadow-[0_-8px_25px_rgba(32,16,11,0.08)]"
      style={{ 
        height: 'calc(62px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {navItems.map((item) => {
        const isActive = item.href === "/" 
          ? pathname === "/" 
          : pathname?.startsWith(item.href) || (item.href === "/profile" && pathname?.startsWith("/orders"));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center h-full flex-1 gap-0.5 transition-all duration-150 select-none",
              isActive ? "text-[#5E3023] font-bold" : "text-navy-900/50 hover:text-[#5E3023] active:scale-95 font-medium"
            )}
            onClick={() => {
              if (item.href === pathname) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative flex items-center justify-center">
              <item.icon 
                size={21} 
                strokeWidth={isActive ? 2.3 : 1.75} 
                className={cn(
                  "transition-transform duration-200",
                  isActive ? "scale-105 text-[#5E3023]" : "",
                  isActive && item.icon === Heart ? "fill-[#5E3023] text-[#5E3023]" : ""
                )} 
              />
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#5E3023] text-[9px] font-bold text-white shadow-xs ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight mt-0.5">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-1 w-3 h-[2.5px] rounded-full bg-[#5E3023] animate-in fade-in zoom-in-75 duration-200" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
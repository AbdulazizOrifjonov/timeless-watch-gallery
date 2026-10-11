"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Heart, Search, ShoppingCart, User, Menu, X, MapPin, CreditCard, Bell, Settings, HelpCircle, LogOut, Package, LayoutDashboard, Phone, Send, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+998 97 555 55 17";
const CONTACT_TEL = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`;
const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me";
const TELEGRAM_ADMIN_URL = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_URL || "https://t.me";

export function Header({
  active = "/",
  isAuthed: _isAuthed, // Ignored, we compute it internally
}: {
  active?: string;
  isAuthed?: boolean;
}) {
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { products, profileSidebarOpen, setProfileSidebarOpen } = useStore();
  const { user, logout } = useAuth();
  const isAuthed = !!user;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const isWishlistActive = pathname?.startsWith("/wishlist");
  const isCartActive = pathname?.startsWith("/cart");
  const isProfileActive = pathname?.startsWith("/profile") || pathname?.startsWith("/login");

  const initialQ = searchParams?.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [focused, setFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setQ(searchParams?.get("q") || "");
  }, [searchParams]);

  const searchResults = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    return products.filter(p => p.is_active && (
      p.name.toLowerCase().includes(term) || 
      (p.brand ?? '').toLowerCase().includes(term)
    )).slice(0, 6);
  }, [q, products]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <>
      <div className="h-[60px] sm:h-[106px] w-full shrink-0" />
      <header className="fixed left-0 top-0 w-full z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
        {/* Top Announcement Bar */}
        <div className="bg-navy-950 text-white/90 border-b border-navy-800 border-t-2 border-t-[#C5A059] text-[11px] py-1 px-4 hidden sm:block">
          <div className="container-shop flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#C5A059] font-bold tracking-wider">⏱ TIMELESS</span>
              <span className="text-white/30">|</span>
              <span className="text-white/80 font-medium">The Watch Gallery — Eksklyuziv original soatlar galereyasi</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href={CONTACT_TEL} className="hover:text-[#C5A059] transition flex items-center gap-1">
                <span className="text-[#C5A059] font-bold">{CONTACT_PHONE}</span>
              </a>
              <span className="text-white/30">|</span>
              <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer" className="hover:text-amber-200 transition text-[#D8B775] font-semibold flex items-center gap-1">
                <span>📢 Telegram Kanal</span>
              </a>
              <span className="text-white/30">|</span>
              <a href={TELEGRAM_ADMIN_URL} target="_blank" rel="noreferrer" className="hover:text-white transition text-white/70">
                Admin bilan bog'lanish
              </a>
            </div>
          </div>
        </div>

        <div className="container-shop flex h-[60px] sm:h-[76px] items-center justify-between gap-3">
          {/* Left: Logo & Desktop Katalog */}
          <div className="flex items-center gap-3 lg:gap-6 lg:w-[280px] shrink-0">
            <Logo hideTextOnMobile={true} />

            <nav className="hidden lg:block ml-2">
              <Link
                href="/products"
                className="group flex h-11 items-center gap-2 rounded-lg bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 px-6 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-[#5E3023]/30 hover:-translate-y-0.5 touch-target"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-transform group-hover:scale-110 text-[#C5A059]"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Katalog
              </Link>
            </nav>
          </div>

          {/* Center: Search (Desktop Only) */}
          <div className="relative hidden lg:flex flex-1 justify-center max-w-xl px-2 lg:px-8">
            <div className="relative w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFocused(false);
                  router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                }}
                className={`flex w-full h-11 items-center gap-2 rounded-lg px-4 transition-all ${
                  focused ? "bg-white shadow-md ring-2 ring-[#5E3023] border-[#5E3023]" : "bg-white border-2 border-navy-100 hover:border-navy-200"
                }`}
              >
                <button type="submit" className="text-navy-900/60 shrink-0 hover:text-[#5E3023] transition touch-target">
                  <Search size={18} />
                </button>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="Soat modeli, brend (Rolex, Cartier, Tissot)..."
                  className="w-full bg-transparent text-[15px] font-medium text-navy-900 outline-none placeholder:font-normal placeholder:text-navy-900/50 input-touch"
                  autoComplete="off"
                />
              </form>
              
              {focused && q.trim() && (
                <div 
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-[calc(100%+8px)] left-0 w-full rounded-2xl border border-navy-100 bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.map(p => (
                        <Link 
                          key={p.id} 
                          href={`/products/${p.slug}`}
                          onClick={() => setFocused(false)}
                          className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-navy-50 transition touch-target"
                        >
                          {p.image ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-navy-50 border border-navy-100/50">
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded bg-navy-50" />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-bold text-navy-900">{p.name}</p>
                            <p className="text-sm font-medium text-navy-900/60 mt-0.5">{p.price.toLocaleString("uz-UZ")} so'm</p>
                          </div>
                        </Link>
                      ))}
                      <Link 
                        href={`/search?q=${encodeURIComponent(q)}`}
                        onClick={() => setFocused(false)}
                        className="mt-2 block rounded-xl bg-navy-900 p-2.5 text-center text-sm font-semibold text-white hover:bg-navy-800 transition shadow-sm touch-target"
                      >
                        Barcha natijalarni ko'rish
                      </Link>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Search size={24} className="mx-auto mb-2 text-navy-900/20" />
                      <p className="text-sm font-medium text-navy-900/50">Hech narsa topilmadi</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Icons (Desktop + Mobile Sleek Actions) */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-6">
            {/* Mobile Call button */}
            <a
              href={CONTACT_TEL}
              title={`Qo'ng'iroq qilish: ${CONTACT_PHONE}`}
              className="flex lg:hidden h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 transition active:scale-95 shadow-xs"
            >
              <Phone size={18} />
            </a>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={cn(
                "flex h-11 w-11 lg:hidden items-center justify-center rounded-lg transition active:scale-95 border",
                searchOpen
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-navy-50/80 text-navy-900 border-navy-200/80 hover:bg-navy-100"
              )}
              aria-label="Qidirish"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>

            {/* Mobile Menu Toggle (Hamburger) */}
            <button
              className={cn(
                "flex lg:hidden h-11 w-11 items-center justify-center rounded-lg border transition active:scale-95 shrink-0",
                mobileMenuOpen
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-navy-50/80 text-navy-900 border-navy-200/80 hover:bg-navy-100"
              )}
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (searchOpen) setSearchOpen(false);
              }}
              aria-label={mobileMenuOpen ? "Yopish" : "Menyu ochish"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Wishlist */}
            <Link href="/wishlist" className="group relative hidden md:flex items-center gap-2 text-navy-900 transition">
              <span className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-lg touch-target transition-colors",
                isWishlistActive ? "bg-[#5E3023] text-white" : "bg-navy-50 group-hover:bg-[#5E3023] group-hover:text-white"
              )}>
                <Heart size={22} />
                {ids.length > 0 && (
                  <span className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm transition-colors",
                    isWishlistActive ? "bg-[#C5A059]" : "bg-[#5E3023] group-hover:bg-[#C5A059]"
                  )}>
                    {ids.length}
                  </span>
                )}
              </span>
              <span className={cn(
                "hidden text-sm font-bold lg:block transition-colors",
                isWishlistActive ? "text-[#5E3023]" : "group-hover:text-[#5E3023]"
              )}>
                Sevimlilar
              </span>
            </Link>

            {/* Desktop Cart */}
            <Link href="/cart" className="group relative hidden md:flex items-center gap-2 text-navy-900 transition">
              <span className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-lg touch-target transition-colors",
                isCartActive ? "bg-[#5E3023] text-white" : "bg-navy-50 group-hover:bg-[#5E3023] group-hover:text-white"
              )}>
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm transition-colors",
                    isCartActive ? "bg-[#C5A059]" : "bg-[#5E3023] group-hover:bg-[#C5A059]"
                  )}>
                    {itemCount}
                  </span>
                )}
              </span>
              <span className={cn(
                "hidden text-sm font-bold lg:block transition-colors",
                isCartActive ? "text-[#5E3023]" : "group-hover:text-[#5E3023]"
              )}>
                Savatcha
              </span>
            </Link>

            {/* Desktop Profile */}
            <Link href={isAuthed ? "/profile" : "/login"} className="group hidden lg:flex items-center gap-2 text-navy-900 transition">
              <span className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg overflow-hidden border transition-colors touch-target",
                isProfileActive 
                  ? "bg-[#5E3023] text-white border-[#5E3023]" 
                  : "bg-navy-50 border-navy-100 group-hover:bg-[#5E3023] group-hover:text-white group-hover:border-[#5E3023]"
              )}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={22} />
                )}
              </span>
              <span className={cn(
                "text-sm font-bold transition-colors",
                isProfileActive ? "text-[#5E3023]" : "group-hover:text-[#5E3023]"
              )}>
                {isAuthed ? (user?.fullName.split(" ")[0] || "Profil") : "Kirish"}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className="lg:hidden absolute left-0 top-[60px] sm:top-[76px] w-full bg-white/98 backdrop-blur-md border-b border-navy-100 shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-navy-200 bg-navy-50/60 px-3 py-2"
            >
              <Search size={18} className="text-navy-900/60 shrink-0" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Asbob nomi, model yoki brend (DeWalt, Bosch, Makita)..."
                className="w-full bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-900/40"
                autoComplete="off"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="p-1 text-navy-400 hover:text-navy-700"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-[#5E3023] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#462016] transition"
              >
                Qidirish
              </button>
            </form>

            {/* Live Search Results on Mobile */}
            {q.trim() && (
              <div className="mt-2.5 max-h-[55vh] overflow-y-auto divide-y divide-navy-50 rounded-xl border border-navy-100 bg-white p-2">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQ("");
                        }}
                        className="flex items-center gap-3 py-2 px-2 hover:bg-navy-50 transition rounded-lg"
                      >
                        {p.image ? (
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-navy-50 border border-navy-100/60">
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-11 w-11 shrink-0 rounded-lg bg-navy-50" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-bold text-navy-900">{p.name}</p>
                          <p className="text-xs font-semibold text-navy-900/60 mt-0.5">
                            {p.price.toLocaleString("uz-UZ")} so'm
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(q)}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setQ("");
                      }}
                      className="mt-2 block rounded-lg bg-navy-900 py-2 text-center text-xs font-semibold text-white hover:bg-navy-800 transition"
                    >
                      Barcha natijalarni ko'rish
                    </Link>
                  </>
                ) : (
                  <p className="py-4 text-center text-xs text-navy-900/50">Mahsulot topilmadi</p>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sidebar (Drawer) */}
      <div className={cn(
        "fixed inset-0 z-[100] lg:hidden transition-all duration-300 ease-in-out",
        mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-navy-100 shrink-0 bg-navy-50/40">
            <Logo hideTextOnMobile={false} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-navy-200/80 text-navy-900 shadow-xs hover:bg-navy-100 transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Quick Contact Box */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900/60">Bog'lanish</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Har kuni 09:00 - 21:00
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <a
                  href={CONTACT_TEL}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white border border-navy-200/80 py-2 text-xs font-bold text-navy-900 shadow-xs hover:bg-navy-50 transition active:scale-95"
                >
                  <Phone size={13} className="text-emerald-600" />
                  Qo'ng'iroq
                </a>
                <a
                  href={TELEGRAM_ADMIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-navy-900 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-800 transition active:scale-95"
                >
                  <Send size={13} />
                  Admin
                </a>
              </div>

              {/* Mobile Telegram Channel Banner */}
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#2AABEE] text-white shadow-xs hover:opacity-95 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Send size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1">
                      Telegram Kanalimiz
                      <span className="text-[9px] bg-[#C5A059] text-white font-extrabold px-1.5 py-0.2 rounded-sm">RASMIY</span>
                    </div>
                    <div className="text-[10px] text-white/85">Eksklyuziv soatlar va maxsus chegirmalar</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-white/25 px-2 py-0.5 rounded-md">A'zo bo'lish</span>
              </a>
            </div>

            {/* Quick Categories Navigation */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900/50">
                Kategoriyalar
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/categories/erkaklar-soatlari"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-[#F5EFEB] hover:text-[#5E3023] transition"
                >
                  <span>⌚</span> Erkaklar soatlari
                </Link>
                <Link
                  href="/categories/ayollar-soatlari"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-[#F5EFEB] hover:text-[#5E3023] transition"
                >
                  <span>✨</span> Ayollar soatlari
                </Link>
                <Link
                  href="/categories/mexanik-soatlar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-[#F5EFEB] hover:text-[#5E3023] transition"
                >
                  <span>⚙️</span> Mexanik soatlar
                </Link>
                <Link
                  href="/categories/kvars-soatlari"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-[#F5EFEB] hover:text-[#5E3023] transition"
                >
                  <span>⏱</span> Kvars soatlari
                </Link>
                <Link
                  href="/categories/shveytsariya-soatlari"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-[#F5EFEB] hover:text-[#5E3023] transition"
                >
                  <span>🇨🇭</span> Shveytsariya
                </Link>
                <Link
                  href="/products?sale=1"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-[#F7F3EE] p-2.5 text-xs font-semibold text-[#5E3023] hover:bg-[#EFE7E2] transition"
                >
                  <span>🏷️</span> Aksiyalar
                </Link>
              </div>
            </div>

            {/* Main Store Links */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900/50">
                Do'kon
              </h3>
              <div className="space-y-1">
                <Link
                  href="/products"
                  className="flex items-center gap-3 rounded-xl bg-[#5E3023] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#5E3023]/20 transition-all hover:bg-[#462016]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  Katalog
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={18} />
                  Sevimlilar
                  {ids.length > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {ids.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart size={18} />
                  Savatcha
                  {itemCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Profile Links */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900/50">
                {isAuthed ? "Profil" : "Hisob"}
              </h3>
              <div className="space-y-1">
                {!isAuthed ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      Kirish / Ro'yxatdan o'tish
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-gold-600 bg-gold-500/10 hover:bg-gold-500/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} className="text-gold-500" />
                      Admin panel
                    </Link>
                  </>
                ) : (
                  <>
                    {(user?.role === "admin" || user?.role === "super_admin") && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <LayoutDashboard size={18} /> Boshqaruv paneli
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                      <User size={18} /> Asosiy ma'lumotlar
                    </Link>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                      <Package size={18} /> Buyurtmalar
                    </Link>
                    <Link href="/profile?tab=address" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                      <MapPin size={18} /> Manzillar
                    </Link>
                    <button 
                      onClick={() => { 
                        setMobileMenuOpen(false); 
                        logout(); 
                        router.push("/"); 
                      }} 
                      className="w-full mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 transition"
                    >
                      <LogOut size={18} /> Chiqish
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quality badge */}
            <div className="pt-3 border-t border-navy-100 flex items-center gap-2 text-xs text-navy-900/65 font-medium">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>100% asl sifat & 12 oy kafolat</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

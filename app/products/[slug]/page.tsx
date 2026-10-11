"use client";

import { use, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { RatingStars } from "@/components/shop/RatingStars";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductCard } from "@/components/shop/ProductCard";
import { useStore } from "@/lib/store";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { calcDiscount, formatSom, getProductPublicUrl, cn } from "@/lib/utils";
import ProductDetailLoading from "./loading";

const TABS = ["Tavsif", "Xususiyatlar", "Sharhlar", "Yetkazib berish", "Qaytarish"];

const TELEGRAM_ADMIN_URL = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_URL || "https://t.me/uzoelektromarket";
const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/uzoelektromarket";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { products, categories, ready } = useStore();
  const { items, addItem, updateQuantity } = useCart();
  const { toggle, isWished } = useWishlist();

  const product = products.find((p) => p.slug === slug || p.id === slug);
  const category = categories.find((c) => c.id === product?.category_id);

  const [activeImage, setActiveImage] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(TABS[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const getProductPageUrl = () => {
    return getProductPublicUrl(product?.slug || slug);
  };

  const [telegramHref, setTelegramHref] = useState(() => {
    const url = getProductPublicUrl(product?.slug || slug);
    const text = `Assalomu alaykum, men ushbu mahsulotni xarid qilmoqchiman:\n\n📦 Mahsulot: ${product?.name || ""}\n💰 Narxi: ${product ? formatSom(product.price) : ""}\n\n🔗 Havola:\n${url}`;
    const base = TELEGRAM_ADMIN_URL.includes("?") ? `${TELEGRAM_ADMIN_URL}&` : `${TELEGRAM_ADMIN_URL}?`;
    return `${base}text=${encodeURIComponent(text)}`;
  });

  useEffect(() => {
    if (product) {
      const url = getProductPublicUrl(product.slug || slug);
      const text = `Assalomu alaykum, men ushbu mahsulotni xarid qilmoqchiman:\n\n📦 Mahsulot: ${product.name}\n💰 Narxi: ${formatSom(product.price)}\n\n🔗 Havola:\n${url}`;
      const base = TELEGRAM_ADMIN_URL.includes("?") ? `${TELEGRAM_ADMIN_URL}&` : `${TELEGRAM_ADMIN_URL}?`;
      setTelegramHref(`${base}text=${encodeURIComponent(text)}`);
    }
  }, [product, slug]);

  const gallery = useMemo(() => {
    if (!product) return [];
    let imgs = [product.image, ...(product.images?.map((i) => i.url) ?? [])].filter(
      Boolean
    ) as string[];
    
    // Ensure at least 3 dummy images if there are less
    if (imgs.length === 0) imgs = ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"];
    while (imgs.length < 3) {
      imgs.push(imgs[0]); // Duplicate the first image as dummy
    }
    return imgs;
  }, [product]);

  const related = useMemo(
    () =>
      products
        .filter((p) => p.id !== product?.id && p.category_id === product?.category_id)
        .slice(0, 4),
    [products, product]
  );

  if (!ready || !product) {
    if (!ready) {
      return <ProductDetailLoading />;
    }
    return (
      <div className="min-h-screen bg-white">
        <Header active="/products" />
        <div className="container-shop py-20 text-center text-navy-900/60">
          Mahsulot topilmadi.
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.discount ?? calcDiscount(product.price, product.old_price);
  const wished = isWished(product.id);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative h-screen w-screen">
            <Image src={gallery[activeImage]} alt={product.name} fill className="object-contain" />
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/30 transition shadow-lg"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {gallery.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev === 0 ? gallery.length - 1 : prev - 1)); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 transition shadow-lg"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev === gallery.length - 1 ? 0 : prev + 1)); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 transition shadow-lg"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="container-shop py-4 text-sm text-navy-900/50">
        <Link href="/">Bosh sahifa</Link> <span className="mx-1">›</span>
        <Link href="/products">Katalog</Link> <span className="mx-1">›</span>
        {category && (
          <>
            <Link href={`/categories/${category.slug}`}>{category.name}</Link>{" "}
            <span className="mx-1">›</span>
          </>
        )}
        <span className="text-navy-900">{product.name}</span>
      </div>

      <div className="container-shop grid grid-cols-1 gap-8 pb-10 lg:grid-cols-2 lg:gap-12 mt-6">
        
        {/* Left Column: Images */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:w-20 xl:w-24 shrink-0">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => { setActiveImage(i); setMainImageLoaded(false); }}
                className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 lg:w-full bg-navy-50/80 ${
                  activeImage === i ? "border-navy-900" : "border-navy-100"
                }`}
              >
                {src && <Image src={src} alt="" fill className="object-cover" />}
              </button>
            ))}
          </div>

          <div 
            className="group relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-navy-50/80 border border-navy-100/70"
          >
            <div className="absolute inset-0 cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
              {/* Luxury Image Loading Skeleton */}
              {!mainImageLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-navy-100/80 via-navy-50/60 to-navy-100/80 animate-pulse">
                  <div className="h-20 w-20 rounded-full border-2 border-navy-200/50 flex items-center justify-center opacity-30">
                    <div className="h-3 w-3 rounded-full bg-navy-300" />
                  </div>
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              )}
              {gallery[activeImage] && (
                <Image 
                  src={gallery[activeImage]} 
                  alt={product.name} 
                  fill 
                  priority 
                  className={cn(
                    "object-cover transition-all duration-500",
                    mainImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )} 
                  onLoad={() => setMainImageLoaded(true)}
                />
              )}
            </div>
            
            {gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev === 0 ? gallery.length - 1 : prev - 1)); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/70 text-navy-900 shadow-md backdrop-blur transition-transform opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 hover:bg-white touch-target"
                  aria-label="Oldingi rasm"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev === gallery.length - 1 ? 0 : prev + 1)); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/70 text-navy-900 shadow-md backdrop-blur transition-transform opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 hover:bg-white touch-target"
                  aria-label="Keyingi rasm"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.brand && (
                  <span className="mb-2 inline-block rounded bg-info px-2 py-0.5 text-xs font-medium text-white">
                    {product.brand}
                  </span>
                )}
                <h1 className="font-serif text-3xl font-bold text-navy-900">{product.name}</h1>
                <p className="mt-1 text-sm text-navy-900/50">{category?.name || "Elektr asbobi"}</p>
              </div>
              <button
                onClick={() => toggle(product.id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-900 transition hover:bg-navy-100 border border-navy-100"
                aria-label="Sevimlilarga qo'shish"
              >
                <Heart size={22} className={wished ? "fill-danger text-danger" : ""} />
              </button>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={product.rating ?? 0} reviews={product.reviews_count} />
            </div>
            
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-5 flex flex-col gap-2 border-t border-navy-100 pt-5">
                {Object.entries(product.specifications).slice(0, 6).map(([key, val], idx) => {
                  const isGenericKey = key.startsWith("Xususiyat");
                  return (
                    <div key={idx} className="flex items-start gap-2 text-[14px] leading-tight text-navy-900/75">
                      <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span>
                        {!isGenericKey && <strong className="font-semibold text-navy-900 mr-1">{key}:</strong>}
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-end gap-3 border-y border-navy-100 py-4">
            <span className="text-3xl font-bold text-navy-900">{formatSom(product.price)}</span>
            {product.old_price && product.old_price > product.price && (
              <span className="mb-1 text-navy-900/40 line-through">{formatSom(product.old_price)}</span>
            )}
            {discount > 0 && (
              <span className="mb-1 rounded bg-danger px-2 py-1 text-xs font-semibold text-white">
                -{discount}%
              </span>
            )}
          </div>

          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Rang</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <span
                    key={c}
                    className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-navy-100 cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="flex items-center gap-1 text-sm text-success">
              <Check size={16} /> Mavjud
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.some(item => item.productId === product.id) ? (
              <div className="flex h-[52px] w-full items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(product.id, (items.find(i => i.productId === product.id)?.quantity || 1) - 1)}
                  className="flex h-full flex-1 items-center justify-center rounded-xl bg-navy-900 text-2xl font-medium text-white transition hover:bg-navy-800 shadow-sm"
                >-</button>
                <div className="flex h-full w-16 shrink-0 items-center justify-center rounded-xl border-2 border-navy-900/10 text-lg font-bold text-navy-900 bg-white">
                  {items.find(i => i.productId === product.id)?.quantity}
                </div>
                <button
                  onClick={() => updateQuantity(product.id, (items.find(i => i.productId === product.id)?.quantity || 1) + 1)}
                  disabled={(items.find(i => i.productId === product.id)?.quantity || 1) >= product.stock}
                  className="flex h-full flex-1 items-center justify-center rounded-xl bg-navy-900 text-2xl font-medium text-white transition hover:bg-navy-800 shadow-sm disabled:opacity-40"
                >+</button>
              </div>
            ) : (
              <button
                onClick={() => addItem(product.id, 1)}
                disabled={product.stock <= 0}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 px-2 text-sm font-bold text-white transition shadow-md shadow-[#5E3023]/25 disabled:opacity-40"
              >
                <ShoppingCart size={18} /> Savatchaga qo'shish
              </button>
            )}

            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (product) {
                  const currentUrl = getProductPageUrl();
                  const text = `Assalomu alaykum, men ushbu soatni xarid qilmoqchiman:\n\n⏱ Soat: ${product.name}\n💰 Narxi: ${formatSom(product.price)}\n\n🔗 Havola:\n${currentUrl}`;
                  const base = TELEGRAM_ADMIN_URL.includes("?") ? `${TELEGRAM_ADMIN_URL}&` : `${TELEGRAM_ADMIN_URL}?`;
                  e.currentTarget.href = `${base}text=${encodeURIComponent(text)}`;
                }
              }}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-2 text-sm font-semibold text-white transition hover:bg-[#2298D6] shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Telegram orqali xarid
            </a>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-3 rounded-xl border border-navy-100 p-4 bg-navy-50/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-navy-900">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Bepul yetkazish</p>
                <p className="text-xs text-navy-900/60">500 000 so'mdan yuqori</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-navy-100 p-4 bg-navy-50/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-navy-900">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Kafolat</p>
                <p className="text-xs text-navy-900/60">2 yil rasmiy kafolat</p>
              </div>
            </div>
          </div>

          {/* Rasmiy Telegram Kanalimizga a'zo bo'ling Banner */}
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-sky-50/60 to-amber-50/40 border border-sky-200/80 hover:border-[#2AABEE] transition-all group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2AABEE] text-white shadow-sm group-hover:scale-105 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-navy-950 group-hover:text-[#0088cc] transition-colors flex items-center gap-1.5">
                  Rasmiy Telegram Kanalimiz
                  <span className="text-[10px] bg-gold-500 text-navy-950 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">VIP</span>
                </div>
                <div className="text-[11px] sm:text-xs text-navy-900/70 mt-0.5">
                  Jonli video-obzorlar, yangi uskunalar va maxsus narxlar!
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#0088cc] group-hover:translate-x-1 transition-transform shrink-0">
              Kanalga o'tish →
            </div>
          </a>
        </div>
      </div>

      {/* Full width tabs */}
      <div className="container-shop mb-12">
        <div className="border-b border-navy-100 flex gap-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 py-4 text-[15px] font-semibold transition ${
                tab === t ? "border-navy-900 text-navy-900" : "border-transparent text-navy-900/40 hover:text-navy-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="py-8 text-navy-900/80 leading-relaxed max-w-4xl">
          {tab === "Tavsif" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy-900">Mahsulot haqida</h3>
              <p>{product.description || "Ushbu mahsulot uchun batafsil tavsif kiritilmagan."}</p>
            </div>
          )}
          {tab === "Xususiyatlar" && (
            <div className="rounded-xl border border-navy-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <tbody>
                  {Object.entries(product.specifications ?? {}).map(([k, v], idx) => (
                    <tr key={k} className={idx % 2 === 0 ? "bg-navy-50/50" : "bg-white"}>
                      <th className="px-6 py-4 font-medium text-navy-900/60 border-b border-navy-100 w-1/3">{k}</th>
                      <td className="px-6 py-4 font-semibold text-navy-900 border-b border-navy-100">{v}</td>
                    </tr>
                  ))}
                  {Object.keys(product.specifications ?? {}).length === 0 && (
                    <tr><td className="px-6 py-4">Xususiyatlar kiritilmagan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {tab === "Sharhlar" && <p>{product.reviews_count ?? 0} ta sharh mavjud.</p>}
          {tab === "Yetkazib berish" && (
            <div className="space-y-2">
              <p>O'zbekiston bo'ylab yetkazib berish 1-3 ish kunida amalga oshiriladi.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Toshkent shahri ichida: 24 soat ichida</li>
                <li>Viloyat markazlariga: 2 ish kuni</li>
                <li>Tumanlarga: 3 ish kunigacha</li>
              </ul>
            </div>
          )}
          {tab === "Qaytarish" && <p>Xarid qilingan mahsulot 14 kun ichida, agar foydalanilmagan va qadoqlari shikastlanmagan bo'lsa, to'liq qaytarilishi yoki boshqa mahsulotga almashtirilishi mumkin.</p>}
        </div>
      </div>

      {related.length > 0 && (
        <div className="container-shop mb-20 bg-navy-50 py-10 rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-navy-900">O'xshash mahsulotlar</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

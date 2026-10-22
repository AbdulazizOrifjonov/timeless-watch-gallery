"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types/database";
import { formatSom, calcDiscount, cn, getProductPublicUrl } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/lib/store";

export const ProductCard = React.memo(function ProductCard({
  product,
  variant = "compact",
}: {
  product: Product;
  variant?: "compact" | "full";
}) {
  const { isWished, toggle } = useWishlist();
  const { addItem, items, updateQuantity } = useCart();
  const { categories } = useStore();
  
  const cartItem = items.find((i) => i.productId === product.id);

  const categoryName =
    product.category?.name ??
    categories.find((c) => c.id === product.category_id)?.name ??
    "";
  const wished = isWished(product.id);
  const discount = product.discount ?? calcDiscount(product.price, product.old_price);
  const outOfStock = product.stock <= 0;

  const getProductFullUrl = () => {
    return getProductPublicUrl(product.slug || product.id);
  };


  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const hasSwipedRef = useRef(false);

  const images = useMemo(() => {
    const raw = [product.image, ...(product.images?.map((i) => i.url) || [])].filter(Boolean) as string[];
    const distinct = Array.from(new Set(raw));
    return distinct.length > 0 ? distinct : ["/placeholder.png"];
  }, [product]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const onTouchStartHandler = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    hasSwipedRef.current = false;
  };

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || images.length <= 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - (touchStartYRef.current ?? touch.clientY);
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 15) {
      hasSwipedRef.current = true;
    }
  };

  const onTouchEndAction = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || images.length <= 1) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - (touchStartYRef.current ?? touch.clientY);
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 25) {
      hasSwipedRef.current = true;
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const onLinkClickHandler = (e: React.MouseEvent) => {
    if (hasSwipedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasSwipedRef.current = false;
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl sm:rounded-2xl border border-navy-100/90 bg-white p-[3px] sm:p-3 transition-all duration-300 hover:shadow-xl hover:border-navy-200",
        variant === "full" ? "flex flex-row gap-3 sm:gap-4 p-2 sm:p-3" : "flex h-full flex-col"
      )}
    >
      {/* Sevimlilar (Wishlist) tugmasi - kartochkaning o'ng yuqori burchagida */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(product.id);
        }}
        aria-label="Sevimlilarga qo'shish"
        className={cn(
          "absolute z-30 flex items-center justify-center rounded-full transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 touch-target",
          variant === "full"
            ? "right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 sm:h-9 sm:w-9 bg-navy-50/90 hover:bg-white border border-navy-100"
            : "right-1.5 top-1.5 sm:right-2 sm:top-2 h-7 w-7 sm:h-9 sm:w-9 bg-white/90 hover:bg-white border border-navy-100/50"
        )}
      >
        <Heart
          size={variant === "full" ? 17 : 15}
          className={wished ? "fill-danger text-danger" : "text-navy-900"}
        />
      </button>

      <div
        className={cn(
          "relative overflow-hidden rounded-lg sm:rounded-xl bg-navy-50/70 shrink-0",
          variant === "full" ? "h-40 w-40 md:h-48 md:w-48" : "mb-[3px] sm:mb-2.5 aspect-[4/5] w-full"
        )}
      >
        {(discount > 0 || product.is_new) && (
          <span
            className={cn(
              "absolute left-1.5 top-1.5 sm:left-2 sm:top-2 z-20 rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs",
              discount > 0 ? "bg-[#C5A059] text-white" : "bg-[#5E3023] text-[#C5A059] border border-[#C5A059]/30"
            )}
          >
            {discount > 0 ? `-${discount}%` : "Yangi"}
          </span>
        )}

        {/* Mechanism tag */}
        <span className="absolute left-1.5 bottom-1.5 sm:left-2 sm:bottom-2 z-20 rounded bg-white/90 backdrop-blur-sm border border-[#C5A059]/30 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold tracking-wider text-[#5E3023] uppercase shadow-sm pointer-events-none">
          {product.mechanism || "Original"}
        </span>

        <Link 
          href={`/products/${product.slug}`} 
          onClick={onLinkClickHandler}
          className="relative block h-full w-full z-10 select-none overflow-hidden"
          onTouchStart={images.length > 1 ? onTouchStartHandler : undefined}
          onTouchMove={images.length > 1 ? onTouchMoveHandler : undefined}
          onTouchEnd={images.length > 1 ? onTouchEndAction : undefined}
          draggable={false}
        >
          {images.length > 0 ? (
            <div 
              className="flex h-full w-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {images.map((src, idx) => (
                <div 
                  key={idx} 
                  className="relative h-full w-full shrink-0 select-none"
                >
                  <SafeImage
                    src={src}
                    fallbackSrc="/placeholder.png"
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    draggable={false}
                    sizes={variant === "full" ? "200px" : "(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"}
                    className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-navy-900/30 bg-navy-50 absolute inset-0 z-10">
              No image
            </div>
          )}
        </Link>
        
        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              aria-label="Oldingi rasm"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white text-navy-900 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={handleNext}
              aria-label="Keyingi rasm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white text-navy-900 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex gap-1 sm:gap-1.5 pointer-events-none">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn("h-1 sm:h-1.5 rounded-full transition-all duration-300 shadow-xs", idx === activeIndex ? "w-2.5 sm:w-3 bg-white" : "w-1 sm:w-1.5 bg-white/50")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col", variant === "full" && "pr-8 sm:pr-12")}>
        {product.brand && (
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-navy-900/55 mb-0.5 block font-mono leading-none">
            {product.brand}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="mb-0.5 sm:mb-1 line-clamp-2 text-[12px] sm:text-sm font-semibold text-navy-900 hover:text-gold-500 md:text-base leading-snug">
          {product.name}
        </Link>
        <p className="mb-1 sm:mb-1.5 text-[10px] sm:text-xs text-navy-900/50 md:text-sm leading-none">{categoryName}</p>
        <RatingStars rating={product.rating ?? 0} reviews={product.reviews_count} size={12} />
        
        {variant === "full" && (
          <p className="mt-2 hidden text-sm text-navy-900/70 md:line-clamp-2">
            {product.description}
          </p>
        )}

        <div className={cn("mt-auto pt-[3px] sm:pt-3", variant === "full" ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" : "")}>
          <div className={cn("mb-[3px] sm:mb-2", variant === "full" ? "mb-0" : "")}>
            <div className="text-[13px] sm:text-[15px] md:text-lg font-bold text-navy-900 leading-tight">
              {formatSom(product.price)}
            </div>
            {product.old_price && product.old_price > product.price && (
              <div className="text-[10px] sm:text-xs text-navy-900/40 line-through">
                {formatSom(product.old_price)}
              </div>
            )}
          </div>

          <div className={cn("flex items-center gap-[3px] sm:gap-2", variant === "full" ? "w-full sm:w-auto sm:min-w-[230px]" : "w-full")}>
            <div className="flex-1">
              {cartItem ? (
                <div className="flex h-8 sm:h-11 w-full items-center justify-between gap-[3px] sm:gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateQuantity(product.id, cartItem.quantity - 1);
                    }}
                    className="flex h-full flex-1 items-center justify-center rounded-lg sm:rounded-xl bg-[#5E3023] text-base sm:text-xl font-medium text-white transition hover:bg-[#4A261C]"
                  >
                    -
                  </button>
                  <div className="flex h-full w-8 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-[#C5A059]/30 text-xs sm:text-[15px] font-bold text-[#5E3023] bg-[#FCFAF7]">
                    {cartItem.quantity}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateQuantity(product.id, cartItem.quantity + 1);
                    }}
                    disabled={cartItem.quantity >= product.stock}
                    className="flex h-full flex-1 items-center justify-center rounded-lg sm:rounded-xl bg-[#5E3023] text-base sm:text-xl font-medium text-white transition hover:bg-[#4A261C] disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem(product.id);
                  }}
                  disabled={outOfStock}
                  className="flex h-8 sm:h-11 w-full items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl bg-[#5E3023] border border-[#5E3023] px-1.5 sm:px-3 text-[11px] sm:text-sm font-medium text-white transition hover:bg-[#4A261C] disabled:opacity-40"
                >
                  <ShoppingCart size={13} className="sm:w-4 sm:h-4 text-[#C5A059]" />
                  <span>
                    <span className="hidden sm:inline">{outOfStock ? "Tugagan" : "Savatchaga"}</span>
                    <span className="sm:hidden">{outOfStock ? "Yo'q" : "Savat"}</span>
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});


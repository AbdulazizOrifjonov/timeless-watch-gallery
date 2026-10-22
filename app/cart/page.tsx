"use client";

import Image from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Trash2, Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/lib/store";
import { formatSom } from "@/lib/utils";
import { Promocode } from "@/types/database";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const { products, applyPromocode } = useStore();
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promocode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const detailed = useMemo(
    () =>
      items
        .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
        .filter((x) => x.product),
    [items, products]
  );

  const subtotal = useMemo(
    () => detailed.reduce((sum, x) => sum + x.product!.price * x.item.quantity, 0),
    [detailed]
  );
  const freeDelivery = useMemo(() => subtotal >= 500000 || subtotal === 0, [subtotal]);
  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  // Restore saved promo if valid
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("gws_applied_promo");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.code) {
          const res = applyPromocode(parsed.code, subtotal);
          if (res.ok) {
            setAppliedPromo(res.promocode!);
            setDiscountAmount(res.discount);
            setPromo(res.promocode!.code);
          }
        }
      }
    } catch {}
  }, []);

  // Re-validate promo when subtotal changes
  useEffect(() => {
    if (appliedPromo) {
      if (subtotal < appliedPromo.min_order_amount) {
        setPromoError(`Minimal buyurtma summasi ${formatSom(appliedPromo.min_order_amount)} bo'lishi kerak. Promokod bekor qilindi.`);
        setAppliedPromo(null);
        setDiscountAmount(0);
        try { sessionStorage.removeItem("gws_applied_promo"); } catch {}
      } else {
        const res = applyPromocode(appliedPromo.code, subtotal);
        if (res.ok) {
          setDiscountAmount(res.discount);
        }
      }
    }
  }, [subtotal, appliedPromo, applyPromocode]);

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    setPromoError("");
    if (!promo.trim()) return;

    const res = applyPromocode(promo, subtotal);
    if (!res.ok) {
      setPromoError(res.error || "Promokod noto'g'ri.");
      setAppliedPromo(null);
      setDiscountAmount(0);
      try { sessionStorage.removeItem("gws_applied_promo"); } catch {}
    } else {
      setAppliedPromo(res.promocode!);
      setDiscountAmount(res.discount);
      setPromoError("");
      try {
        sessionStorage.setItem("gws_applied_promo", JSON.stringify({
          code: res.promocode!.code,
          discount: res.discount,
          min_order_amount: res.promocode!.min_order_amount
        }));
      } catch {}
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromo("");
    setPromoError("");
    try { sessionStorage.removeItem("gws_applied_promo"); } catch {}
  }

  const suggestions = products.filter((p) => !items.some((i) => i.productId === p.id)).slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />

      <div className="container-shop py-4 text-sm text-navy-900/50">
        <Link href="/">Bosh sahifa</Link> <span className="mx-1">›</span>
        <span className="text-navy-900">Savatcha</span>
      </div>

      <div className="container-shop grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-navy-100">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Savatcha</h1>
                  {detailed.length > 0 && (
                    <span className="rounded-full bg-[#5E3023] px-2.5 py-0.5 text-xs font-bold text-white border border-[#C5A059]/40">
                      {detailed.length} ta
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-navy-900/50 mt-0.5">Siz tanlagan mahsulotlar</p>
              </div>

              {/* Mobile Clear Button */}
              {detailed.length > 0 && (
                <button
                  onClick={clear}
                  className="sm:hidden flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-red-100 transition active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>Tozalash</span>
                </button>
              )}
            </div>

            {/* Desktop Clear Button */}
            {detailed.length > 0 && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-navy-900/50">{detailed.length} ta mahsulot</span>
                <button
                  onClick={clear}
                  className="flex items-center gap-1.5 rounded-lg border border-navy-200/80 px-3.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-red-50 hover:text-danger hover:border-red-200 transition"
                >
                  <Trash2 size={14} />
                  <span>Barchasini o'chirish</span>
                </button>
              </div>
            )}
          </div>

          {detailed.length === 0 ? (
            <div className="rounded-xl border border-dashed border-navy-100 py-20 text-center">
              <p className="mb-4 text-navy-900/50">Savatchangiz bo'sh.</p>
              <Link href="/products" className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white">
                Xarid qilishni boshlash
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {detailed.map(({ item, product }) => (
                <div
                  key={item.productId}
                  className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#C5A059]/40 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Left: Product Image & Comprehensive Luxury Details */}
                    <div className="flex items-start gap-3.5 sm:gap-5 flex-1 min-w-0">
                      {/* Watch Thumbnail */}
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[#FCFAF7] border border-navy-100/80 p-1 flex items-center justify-center">
                        {product!.image ? (
                          <SafeImage src={product!.image} fallbackSrc="/placeholder.png" alt={product!.name} fill className="object-contain p-1" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-navy-400 text-xs">
                            Rasm yo'q
                          </div>
                        )}
                      </div>

                      {/* Watch Information */}
                      <div className="flex-1 min-w-0 pr-1">
                        {/* Brand & Stock badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {product!.brand && (
                            <span className="inline-flex items-center rounded-md bg-[#5E3023]/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5E3023] border border-[#5E3023]/20">
                              {product!.brand}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {product!.stock > 0 ? "✓ Omborda mavjud" : "Tugagan"}
                          </span>
                        </div>

                        {/* Full Product Name without truncation */}
                        <Link
                          href={`/products/${product!.slug}`}
                          className="font-serif text-sm sm:text-base font-bold text-navy-900 hover:text-[#C5A059] transition-colors leading-snug line-clamp-2 block"
                          title={product!.name}
                        >
                          {product!.name}
                        </Link>

                        {/* Specifications & Unit Price */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-900/60">
                          {product!.mechanism && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-navy-700 bg-navy-50/80 px-2 py-0.5 rounded border border-navy-100">
                              ⚙️ {product!.mechanism}
                            </span>
                          )}
                          <span className="font-semibold text-navy-900/70">
                            {formatSom(product!.price)} <span className="font-normal text-navy-900/40">/ dona</span>
                          </span>
                        </div>
                      </div>

                      {/* Mobile Delete Button (top right) */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label="Mahsulotni o'chirish"
                        className="sm:hidden -mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-400 hover:bg-red-50 hover:text-danger transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Right: Quantity Selector & Fixed Width Total Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 border-navy-100/60 pt-3 sm:pt-0 shrink-0">
                      {/* Quantity Selector Container (Fixed Width) */}
                      <div className="shrink-0 flex items-center">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(v) => updateQuantity(item.productId, v)}
                          max={product!.stock || 99}
                        />
                      </div>

                      {/* Total Line Price Column (FIXED WIDTH: w-32 sm:w-36 md:w-40, right-aligned so buttons never shift!) */}
                      <div className="w-32 sm:w-36 md:w-40 shrink-0 text-right">
                        <div className="text-base sm:text-lg font-bold text-navy-900 whitespace-nowrap tabular-nums">
                          {formatSom(product!.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[11px] font-medium text-navy-900/45 whitespace-nowrap tabular-nums">
                            {item.quantity} × {formatSom(product!.price)}
                          </div>
                        )}
                      </div>

                      {/* Desktop Delete Button (Fixed Width) */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label="Mahsulotni o'chirish"
                        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy-100 text-navy-400 hover:border-red-200 hover:bg-red-50 hover:text-danger transition active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="sticky top-[100px] self-start space-y-4 rounded-xl border border-navy-100 p-5 bg-white shadow-2xs">
          <h2 className="text-lg font-bold text-navy-900">Buyurtma haqida</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-900/60">Mahsulotlar ({detailed.length} ta)</span>
              <span className="font-semibold text-navy-900">{formatSom(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-900/60">Yetkazib berish</span>
              <span className={freeDelivery ? "text-success font-semibold" : "font-semibold text-navy-900"}>
                {freeDelivery ? "Bepul" : formatSom(30000)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-success font-semibold animate-in fade-in duration-200">
                <span className="flex items-center gap-1">
                  <Ticket size={14} /> Chegirma ({appliedPromo?.code})
                </span>
                <span>- {formatSom(discountAmount)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between border-t border-navy-100 pt-3 text-lg font-bold text-navy-950">
            <span>Jami</span>
            <span>{formatSom(total + (freeDelivery ? 0 : 30000))}</span>
          </div>
          <Link
            href="/checkout"
            className={`block rounded-xl py-3.5 text-center font-bold text-white transition shadow-md ${
              detailed.length === 0 ? "pointer-events-none bg-navy-900/30" : "bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 shadow-[#5E3023]/25"
            }`}
          >
            Buyurtmani rasmiylashtirish →
          </Link>

          {/* Promokod Section */}
          <div className="border-t border-navy-100/80 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-navy-900 uppercase tracking-wider">
                <Ticket size={14} className="text-gold-500" /> Promokod
              </span>
              {appliedPromo && (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-xs font-semibold text-danger hover:underline"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-semibold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-mono font-bold tracking-wide">&ldquo;{appliedPromo.code}&rdquo;</span> qo'llandi
                    <div className="text-[11px] font-normal text-emerald-700">-{formatSom(discountAmount)} chegirma berildi</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-emerald-700 hover:text-danger p-1 font-bold text-sm"
                  title="Promokodni bekor qilish"
                >
                  ✕
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => {
                      setPromo(e.target.value.toUpperCase().replace(/\s+/g, ""));
                      if (promoError) setPromoError("");
                    }}
                    placeholder="Masalan: GRAND10"
                    className="flex-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider outline-none focus:border-navy-900 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-navy-900 px-3.5 text-xs font-semibold text-white hover:bg-navy-800 transition shadow-xs"
                  >
                    Qo'llash
                  </button>
                </div>
                {promoError && (
                  <p className="flex items-start gap-1.5 text-xs font-medium text-danger leading-tight pt-1">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{promoError}</span>
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="rounded-lg bg-navy-50 p-3 text-xs text-navy-900/70">
            🚚 Bepul yetkazib berish — 500 000 so'mdan yuqori buyurtmalarda
          </div>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <div className="container-shop pb-16">
          <h2 className="mb-4 text-lg font-bold text-navy-900">Sizga tavsiya etamiz</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

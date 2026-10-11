"use client";

import Link from "next/link";
import { Trash2, Heart } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { ids, clear } = useWishlist();
  const { products } = useStore();
  const wished = products.filter((p) => ids.includes(p.id));

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />

      <div className="container-shop py-4 text-sm text-navy-900/50">
        <Link href="/">Bosh sahifa</Link> <span className="mx-1">›</span>
        <span className="text-navy-900">Sevimlilar</span>
      </div>

      <div className="container-shop pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-navy-50 p-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy-900">Sevimlilar</h1>
            <p className="text-sm text-navy-900/50">Siz yoqtirgan mahsulotlar har doim siz bilan</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-navy-900/50">{wished.length} ta mahsulot</span>
          {wished.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={clear} className="flex items-center gap-1 text-xs sm:text-sm text-navy-900/70 hover:text-danger rounded-lg border border-navy-200/80 px-2.5 py-1.5 transition">
                <Trash2 size={13} /> <span>Tozalash</span>
              </button>
              <Link href="/products" className="rounded-lg bg-navy-900 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-navy-800 transition">
                Katalog
              </Link>
            </div>
          )}
        </div>

        {wished.length === 0 ? (
          <div className="rounded-xl border border-dashed border-navy-100 py-20 text-center">
            <p className="mb-4 text-navy-900/50">Sevimlilar ro'yxati bo'sh.</p>
            <Link href="/products" className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white">
              Katalogga o'tish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {wished.map((p) => {
              const favCount = (p.id.charCodeAt(0) + (p.id.charCodeAt(p.id.length - 1) || 0)) * 3 + 12 + Math.round(p.rating ?? 0) * 10;
              return (
                <div key={p.id} className="flex flex-col h-full">
                  <div className="flex-1">
                    <ProductCard product={p} />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger/20">
                    <Heart size={14} className="fill-danger" />
                    <span>{favCount} kishi sevimlilarga qo'shgan</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

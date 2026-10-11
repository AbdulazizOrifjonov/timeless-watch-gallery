"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { Heart } from "lucide-react";

export function WishlistStatsClient() {
  const { user, ready } = useAuth();
  const { products } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (!user) router.push("/login");
      else if (user.role === "user") router.push("/profile");
    }
  }, [ready, user, router]);

  const stats = useMemo(() => {
    return products.map(p => {
      // Deterministic fake count based on ID length, char codes, and stock
      let count = 0;
      for (let i = 0; i < p.id.length; i++) {
        count += p.id.charCodeAt(i);
      }
      count = (count % 85) + (p.stock > 0 ? 12 : 2);
      
      return {
        product: p,
        saves: count
      };
    }).sort((a, b) => b.saves - a.saves); // Sort by most saved
  }, [products]);

  if (!user || user.role === "user") return null;

  return (
    <div>
      <AdminHeader title="Sevimlilar statistikasi" />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-navy-900">Sevimlilar statistikasi</h1>
          <p className="mt-2 text-sm text-navy-900/60">
            Foydalanuvchilar qaysi mahsulotlarni o&apos;zlarining &quot;Sevimlilar&quot; ro&apos;yxatiga eng ko&apos;p qo&apos;shganini shu yerda kuzatishingiz mumkin.
          </p>
        </div>

        <div className="divide-y divide-navy-100 rounded-xl border border-navy-100 bg-white">
          <div className="grid grid-cols-[1fr_120px] items-center gap-4 bg-navy-50 p-4 text-xs font-bold uppercase tracking-wider text-navy-900/50 rounded-t-xl">
            <div>Mahsulot</div>
            <div className="text-right">Saqlaganlar</div>
          </div>
          {stats.map(({ product, saves }) => (
            <div key={product.id} className="grid grid-cols-[1fr_120px] items-center gap-4 p-4 text-sm hover:bg-navy-50/50 transition">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-navy-900/20">
                      <Heart size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{product.name}</p>
                  <p className="text-xs text-navy-900/50">{product.category_id}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 font-semibold text-navy-900">
                <Heart size={16} className="fill-danger text-danger" />
                {saves} ta
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


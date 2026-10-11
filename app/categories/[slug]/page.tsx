"use client";

import { use } from "react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { CatalogView } from "@/components/shop/CatalogView";
import { useStore } from "@/lib/store";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { categories } = useStore();
  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />
      <section className="relative flex h-[200px] items-center overflow-hidden bg-navy-950 text-white">
        <div className="container-shop">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Kategoriya</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">{category?.name ?? "Kategoriya"}</h1>
          {category?.description && <p className="mt-2 text-white/70">{category.description}</p>}
        </div>
      </section>
      <CatalogView initialCategorySlug={slug} title={category?.name ?? "Mahsulotlar"} />
      <Footer />
    </div>
  );
}

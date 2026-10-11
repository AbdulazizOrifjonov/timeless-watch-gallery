"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { CatalogView } from "@/components/shop/CatalogView";

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <div className="min-h-screen bg-white">
      <Header active="/search" />
      <CatalogView initialSearch={q} title={q ? `"${q}" bo'yicha natijalar` : "Qidiruv"} />
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}

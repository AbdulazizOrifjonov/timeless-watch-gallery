"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, X, Menu, Filter } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";

const PAGE_SIZE = 12;

export function CatalogView({
  initialCategorySlug,
  initialSearch,
  saleOnly = false,
  title = "Barcha mahsulotlar",
}: {
  initialCategorySlug?: string;
  initialSearch?: string;
  saleOnly?: boolean;
  title?: string;
}) {
  const { products, categories, ready } = useStore();
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug ?? "all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [priceMax, setPriceMax] = useState(50000000);
  const [view, setView] = useState<"grid" | "list">("grid");

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[],
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.is_active);

    if (categorySlug !== "all") {
      const cat = categories.find((c) => c.slug === categorySlug);
      list = list.filter((p) => p.category_id === cat?.id);
    }
    if (initialSearch) {
      const q = initialSearch.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
      );
    }
    if (saleOnly) {
      list = list.filter((p) => p.discount || (p.old_price && p.old_price > p.price));
    }
    if (selectedBrands.length) {
      list = list.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }
    list = list.filter((p) => p.price <= priceMax);

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "new") list = [...list].sort((a, b) => (a.is_new === b.is_new ? 0 : a.is_new ? -1 : 1));
    if (sort === "popular") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [products, categories, categorySlug, initialSearch, saleOnly, selectedBrands, priceMax, sort]);

  const pageSize = 60;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleBrand(b: string) {
    setPage(1);
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="container-shop grid grid-cols-1 gap-8 py-8 lg:grid-cols-[260px_1fr] lg:items-start">
      {/* Mobile Filter Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileFiltersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileFiltersOpen(false)}
      />

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto bg-white p-6 shadow-2xl transition-transform lg:static lg:w-auto lg:p-0 lg:shadow-none lg:z-auto lg:translate-x-0 lg:sticky lg:top-[100px] lg:block space-y-8 custom-scrollbar",
          mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h2 className="font-bold text-lg text-navy-900">Filterlar</h2>
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-900"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-navy-900">Kategoriyalar</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={categorySlug === "all"}
                    onChange={() => { setCategorySlug("all"); setPage(1); setMobileFiltersOpen(false); }}
                  />
                  Barchasi
                </span>
                <span className="text-navy-900/40">{products.length}</span>
              </label>
            </li>
            {categories.filter((c) => c.is_active).map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={categorySlug === c.slug}
                      onChange={() => { setCategorySlug(c.slug); setPage(1); setMobileFiltersOpen(false); }}
                    />
                    {c.name}
                  </span>
                  <span className="text-navy-900/40">
                    {products.filter((p) => p.category_id === c.id).length}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-navy-900">Narx oralig'i</h3>
          <input
            type="range"
            min={0}
            max={50000000}
            step={100000}
            value={priceMax}
            onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
            className="w-full accent-[#5E3023]"
          />
          <div className="mt-1 flex justify-between text-xs text-navy-900/50">
            <span>0 so'm</span>
            <span>{priceMax.toLocaleString("uz-UZ")} so'm</span>
          </div>
        </div>

        {brands.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-navy-900">Brend</h3>
            <ul className="space-y-2 text-sm">
              {brands.map((b) => (
                <li key={b}>
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} />
                      {b}
                    </span>
                    <span className="text-navy-900/40">
                      {
                        products.filter(
                          (p) =>
                            p.brand === b &&
                            (categorySlug === "all" || p.category_id === categories.find((c) => c.slug === categorySlug)?.id) &&
                            p.price <= priceMax &&
                            (!saleOnly || p.discount || (p.old_price && p.old_price > p.price))
                        ).length
                      }
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div>
        {/* Quick Category Chips for Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 lg:hidden -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => { setCategorySlug("all"); setPage(1); }}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs",
              categorySlug === "all"
                ? "bg-navy-900 text-white"
                : "bg-navy-50 text-navy-900 border border-navy-200/80 hover:bg-navy-100"
            )}
          >
            Barchasi ({products.length})
          </button>
          {categories.filter(c => c.is_active).map(cat => {
            const count = products.filter(p => p.category_id === cat.id).length;
            const isSelected = categorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => { setCategorySlug(cat.slug); setPage(1); }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs",
                  isSelected
                    ? "bg-navy-900 text-white"
                    : "bg-navy-50 text-navy-900 border border-navy-200/80 hover:bg-navy-100"
                )}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900">{title}</h1>
              <p className="text-xs sm:text-sm text-navy-900/50">{filtered.length} ta mahsulot</p>
            </div>
          </div>

          {/* Unified Controls Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Filter Toggle Mobile */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex flex-1 sm:hidden h-10 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-3 text-xs font-bold text-navy-900 shadow-xs active:scale-95 transition"
            >
              <Filter size={15} />
              <span>Filterlar</span>
              {(selectedBrands.length > 0 || priceMax < 50000000) && (
                <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-950">
                  {selectedBrands.length + (priceMax < 50000000 ? 1 : 0)}
                </span>
              )}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-navy-900 shadow-xs outline-none"
            >
              <option value="popular">Mashhurlar</option>
              <option value="new">Yangi kelganlar</option>
              <option value="price_asc">Narx: arzonroq</option>
              <option value="price_desc">Narx: qimmatroq</option>
            </select>

            <div className="flex overflow-hidden rounded-xl border border-navy-200 bg-white shadow-xs shrink-0">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid ko'rinishi"
                className={`flex h-10 w-10 items-center justify-center transition ${view === "grid" ? "bg-navy-900 text-white" : "text-navy-900/50 hover:text-navy-900"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="Ro'yxat ko'rinishi"
                className={`flex h-10 w-10 items-center justify-center transition ${view === "list" ? "bg-navy-900 text-white" : "text-navy-900/50 hover:text-navy-900"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {!ready ? (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-responsive"
                : "flex flex-col gap-4"
            }
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} variant={view === "list" ? "full" : "compact"} />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-navy-100 py-20 text-center text-navy-900/50">
            Hech qanday mahsulot topilmadi.
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-responsive"
                : "flex flex-col gap-4"
            }
          >
            {pageItems.map((p: Product) => (
              <ProductCard key={p.id} product={p} variant={view === "list" ? "full" : "compact"} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                    page === p ? "bg-[#5E3023] text-white font-bold shadow-xs border border-[#C5A059]/40" : "border border-navy-100 text-navy-900"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

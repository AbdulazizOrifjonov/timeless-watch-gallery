"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper, Sparkles, Search, Tag, Eye } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { useStore } from "@/lib/store";
import { NewsType } from "@/types/database";

const TYPE_CONFIG: Record<NewsType, { label: string; icon: string }> = {
  yangilik: { label: "Yangiliklar", icon: "📰" },
  aksiya: { label: "Aksiyalar", icon: "🔥" },
  reklama: { label: "Reklama", icon: "📢" },
  tavsiya: { label: "Foydali tavsiyalar", icon: "💡" },
};

export default function NewsPage() {
  const { news } = useStore();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const activeNews = useMemo(() => {
    return news.filter((n) => n.is_active);
  }, [news]);

  const filtered = useMemo(() => {
    return activeNews.filter((item) => {
      const matchType = selectedType === "all" || item.type === selectedType;
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (item.badge && item.badge.toLowerCase().includes(search.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [activeNews, selectedType, search]);

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col justify-between">
      <div>
        <Header active="/news" />

        {/* Hero Banner for News */}
        <section className="bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white py-12 border-b-2 border-[#C5A059]">
          <div className="container-shop text-center max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#C5A059] backdrop-blur-xs">
              <Sparkles size={14} />
              <span>Timeless Galereyasi Yangiliklari</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Yangiliklar, Aksiyalar va E'lonlar
            </h1>
            <p className="text-sm text-white/70 leading-relaxed">
              Eksklyuziv soatlar olamidagi eng so'nggi yangiliklar, maxsus chegirmalar, sovg'alar va foydali tavsiyalar bilan tanishing.
            </p>
          </div>
        </section>

        {/* Filters and List */}
        <div className="container-shop py-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedType("all")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                  selectedType === "all"
                    ? "bg-[#5E3023] text-white shadow-sm border border-[#C5A059]/40"
                    : "bg-white border border-navy-100 text-navy-900/70 hover:bg-navy-50"
                }`}
              >
                Barchasi ({activeNews.length})
              </button>
              {(["yangilik", "aksiya", "reklama", "tavsiya"] as NewsType[]).map((t) => {
                const count = activeNews.filter((n) => n.type === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                      selectedType === t
                        ? "bg-[#5E3023] text-white shadow-sm border border-[#C5A059]/40"
                        : "bg-white border border-navy-100 text-navy-900/70 hover:bg-navy-50"
                    }`}
                  >
                    <span>{TYPE_CONFIG[t].icon}</span>
                    <span>{TYPE_CONFIG[t].label}</span>
                    <span className="opacity-60 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative sm:w-72">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Yangiliklarni qidirish..."
                className="w-full rounded-full border border-navy-100 bg-white pl-9 pr-4 py-2 text-xs font-medium text-navy-900 outline-none focus:border-navy-900 shadow-2xs"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-navy-900/40" />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xs hover:shadow-xl hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden bg-navy-950 shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {item.badge ? (
                      <span className="rounded-lg bg-[#5E3023] border border-[#C5A059]/50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="rounded-lg bg-navy-900/80 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                        {item.type}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">
                    {new Date(item.published_at || item.created_at).toLocaleDateString("uz-UZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-navy-900 leading-snug group-hover:text-[#5E3023] transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    {item.subtitle && (
                      <p className="text-xs text-navy-900/60 leading-relaxed line-clamp-3">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-navy-50 flex items-center justify-between">
                    <Link
                      href={`/news/${item.slug || item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E3023] hover:underline"
                    >
                      <span>{item.button_text || "Batafsil o'qish"}</span>
                      <ArrowRight size={13} />
                    </Link>

                    {item.link && (
                      <a
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="rounded-lg bg-navy-50 hover:bg-[#F5EFEB] px-3 py-1.5 text-xs font-bold text-navy-900 transition"
                      >
                        Aksiyaga o'tish →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-navy-100 bg-white p-12 text-center text-sm text-navy-900/50 space-y-2">
              <Newspaper size={36} className="mx-auto text-navy-900/30" />
              <p>Hozircha bunday turdagi yangiliklar mavjud emas.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

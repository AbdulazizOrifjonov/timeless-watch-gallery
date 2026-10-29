"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Newspaper, Megaphone } from "lucide-react";
import { useStore } from "@/lib/store";
import { NewsItem } from "@/types/database";

export function NewsPromoSection() {
  const { news } = useStore();

  const activeNews = news.filter((n) => n.is_active).slice(0, 3);

  if (activeNews.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-white via-[#FCFAF7] to-white border-y border-navy-100/60">
      <div className="container-shop space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
              <Sparkles size={14} />
              <span>Maxsus e'lonlar & Yangiliklar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Yangiliklar va Aksiyalar
            </h2>
          </div>
          <Link
            href="/news"
            className="group flex items-center gap-1.5 text-sm font-bold text-[#5E3023] hover:text-[#462016] transition"
          >
            <span>Barcha yangiliklarni ko'rish</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* News & Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeNews.map((item, idx) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xs hover:shadow-xl hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-navy-950 shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />

                {/* Badge Tag */}
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

                <div className="absolute bottom-3 left-3 text-[11px] font-medium text-white/80">
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
                  <h3 className="text-base sm:text-lg font-bold text-navy-900 leading-snug group-hover:text-[#5E3023] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-navy-900/60 leading-relaxed line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}
                  {item.product_ids && item.product_ids.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1 w-fit mt-1">
                      <Sparkles size={12} className="text-amber-700" />
                      <span>{item.product_ids.length} ta soat {item.discount_percent ? `-${item.discount_percent}% chegirmada` : "aksiyada"}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-navy-50 flex items-center justify-between">
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
                      className="rounded-lg bg-navy-50 hover:bg-[#F5EFEB] px-2.5 py-1 text-[11px] font-bold text-navy-900 transition"
                    >
                      Aksiyaga o'tish →
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

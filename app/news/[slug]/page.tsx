"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Eye, Share2, Sparkles, ExternalLink, Package } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { useStore } from "@/lib/store";

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { news, products } = useStore();

  const item = news.find((n) => n.slug === slug || n.id === slug);

  const campaignProducts = useMemo(() => {
    if (!item?.product_ids || item.product_ids.length === 0) return [];
    return products.filter((p) => item.product_ids?.includes(p.id) && p.is_active);
  }, [item, products]);

  const related = news
    .filter((n) => n.id !== item?.id && n.is_active)
    .slice(0, 3);

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header active="/news" />
        <div className="container-shop py-24 text-center space-y-4">
          <h1 className="text-2xl font-bold text-navy-900">Yangilik topilmadi</h1>
          <p className="text-sm text-navy-900/60">
            Kechirasiz, siz qidirayotgan yangilik yoki reklama e'loni mavjud emas yoki o'chirilgan.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition"
          >
            <ArrowLeft size={16} /> Barcha yangiliklarga qaytish
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col justify-between">
      <div>
        <Header active="/news" />

        {/* Breadcrumb */}
        <div className="border-b border-navy-100 bg-white">
          <div className="container-shop py-3 flex items-center gap-2 text-xs text-navy-900/60">
            <Link href="/" className="hover:text-navy-900">
              Bosh sahifa
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-navy-900">
              Yangiliklar
            </Link>
            <span>/</span>
            <span className="text-navy-900 font-bold truncate max-w-xs">{item.title}</span>
          </div>
        </div>

        {/* Article Container */}
        <article className="container-shop py-10 max-w-5xl space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {item.badge && (
                <span className="rounded-lg bg-[#5E3023] border border-[#C5A059]/40 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs">
                  {item.badge}
                </span>
              )}
              {item.discount_percent && (
                <span className="rounded-lg bg-danger px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                  -{item.discount_percent}% Aksiya
                </span>
              )}
              <span className="rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-900 uppercase">
                {item.type}
              </span>
              <div className="flex items-center gap-4 text-xs text-navy-900/50 ml-auto">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {new Date(item.published_at || item.created_at).toLocaleDateString("uz-UZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  {(item.views_count || 0) + 1} marta ko'rildi
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
              {item.title}
            </h1>

            {item.subtitle && (
              <p className="text-base sm:text-lg text-navy-900/70 font-medium leading-relaxed border-l-4 border-[#C5A059] pl-4 italic">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Banner Image */}
          <div className="relative h-[260px] sm:h-[440px] w-full overflow-hidden rounded-3xl bg-navy-950 shadow-xl border border-navy-100">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Text Content */}
          <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-10 shadow-2xs space-y-6 text-navy-900 leading-relaxed text-sm sm:text-base">
            {item.content.split("\n").map((para, i) => {
              const trimmed = para.trim();
              if (!trimmed) return null;
              return (
                <p key={i} className="text-navy-900/85">
                  {trimmed}
                </p>
              );
            })}

            {/* Action Callout Box */}
            {item.link && (
              <div className="mt-8 rounded-2xl bg-gradient-to-r from-navy-950 to-navy-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[#C5A059]/40 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Maxsus taklif</span>
                  </div>
                  <h4 className="text-lg font-bold">Ushbu aksiyadan foydalanishni xohlaysizmi?</h4>
                  <p className="text-xs text-white/70">
                    Batafsil ma'lumot olish yoki xaridni amalga oshirish uchun havolaga o'ting.
                  </p>
                </div>
                <a
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/50 px-6 py-3 text-sm font-bold text-white transition shadow-lg shrink-0 active:scale-95"
                >
                  <span>{item.button_text || "Aksiyaga o'tish"}</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* AKSIYADA ISHTIROK ETAYOTGAN MAHSULOTLAR (REAL PRODUCT CARDS) */}
          {/* ======================================================== */}
          {campaignProducts.length > 0 && (
            <section className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                    <Sparkles size={14} />
                    <span>Aksiya mahsulotlari</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1">
                    Ushbu aksiya doirasidagi chegirmali soatlar ({campaignProducts.length} ta)
                  </h2>
                  <p className="text-xs text-navy-900/60 mt-0.5">
                    Har bir soatni tanlab, uning to'liq sahifasiga o'tishingiz yoki to'g'ridan-to'g'ri savatchaga qo'shishingiz mumkin.
                  </p>
                </div>
                {item.discount_percent && (
                  <span className="rounded-xl bg-danger px-3.5 py-1.5 text-xs font-bold text-white shadow-xs self-start sm:self-auto">
                    🔥 -{item.discount_percent}% Maxsus chegirma narxida
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {campaignProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Back Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-navy-50 transition shadow-2xs"
            >
              <ArrowLeft size={14} /> Barcha yangiliklar ro'yxatiga qaytish
            </Link>
          </div>

          {/* Related News Section */}
          {related.length > 0 && (
            <div className="pt-10 border-t border-navy-100 space-y-6">
              <h3 className="text-xl font-bold text-navy-900">Boshqa yangiliklar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/news/${rel.slug || rel.id}`}
                    className="group block rounded-2xl border border-navy-100 bg-white p-3 shadow-2xs hover:shadow-md transition"
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-navy-950 mb-3">
                      <Image
                        src={rel.image_url}
                        alt={rel.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#5E3023] uppercase">
                      {rel.badge || rel.type}
                    </span>
                    <h4 className="text-xs font-bold text-navy-900 line-clamp-2 mt-1 group-hover:text-[#5E3023] transition-colors">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <Footer />
    </div>
  );
}

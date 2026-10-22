import { SafeImage } from "@/components/ui/SafeImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types/database";

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  "erkaklar-soatlari": "/banners/rolex_oyster_perpetual.jpg",
  "ayollar-soatlari": "/products/tissot_bellissima_swiss_ladies.png",
  "mexanik-soatlar": "/banners/iwc_tourbillon_skeleton.jpg",
  "kvars-soatlari": "/products/tissot_prx_40mm_blue_dial_quartz.jpg",
  "shveytsariya-soatlari": "/banners/omega_speedmaster_chronograph.jpg",
  aksessuarlar: "/banners/citizen_chronograph_tachymeter.jpg",
};

const DEFAULT_IMAGE = "/banners/rolex_oyster_perpetual.jpg";

export function CategoryCard({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  const isExternalUnsplash = category.image_url?.includes("unsplash.com");
  const imageUrl = (!category.image_url || isExternalUnsplash) 
    ? (FALLBACK_CATEGORY_IMAGES[category.slug] || DEFAULT_IMAGE)
    : category.image_url;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group relative flex h-[160px] sm:h-[185px] w-[220px] sm:w-[270px] shrink-0 items-end overflow-hidden rounded-2xl bg-navy-950 border border-navy-800/80 shadow-md hover:shadow-xl hover:shadow-navy-950/20 hover:border-[#C5A059]/60 transition-all duration-300 select-none ${className}`}
    >
      <SafeImage
        src={imageUrl}
        fallbackSrc={FALLBACK_CATEGORY_IMAGES[category.slug] || DEFAULT_IMAGE}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 220px, 270px"
        className="object-cover opacity-75 transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Luxury dark gradient overlay for crystal clear readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent transition-opacity duration-300 group-hover:from-navy-950/90" />

      {/* Top category label badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-navy-950/80 border border-[#C5A059]/30 backdrop-blur-xs text-[10px] sm:text-[11px] font-bold tracking-wider text-[#D8B775] uppercase">
          Kategoriya
        </span>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10 flex w-full items-end justify-between p-4 text-white">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight drop-shadow-xs group-hover:text-[#D8B775] transition-colors">
            {category.name}
          </h3>
          <span className="text-[11px] sm:text-xs text-white/70 group-hover:text-white/90 transition-colors flex items-center gap-1 mt-0.5 font-medium">
            Kolleksiyani ko'rish
          </span>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-all duration-300 group-hover:bg-[#5E3023] group-hover:border group-hover:border-[#C5A059]/50 group-hover:translate-x-0.5 group-hover:scale-105 shadow-xs">
          <ArrowRight size={14} className="group-hover:text-[#D8B775]" />
        </span>
      </div>
    </Link>
  );
}

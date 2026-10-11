import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types/database";

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  "erkaklar-soatlari": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
  "ayollar-soatlari": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800&auto=format&fit=crop",
  "mexanik-soatlar": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop",
  "kvars-soatlari": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
  "shveytsariya-soatlari": "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop",
  aksessuarlar: "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop";

export function CategoryCard({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  const imageUrl = category.image_url || FALLBACK_CATEGORY_IMAGES[category.slug] || DEFAULT_IMAGE;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group relative flex h-[160px] sm:h-[185px] w-[220px] sm:w-[270px] shrink-0 items-end overflow-hidden rounded-2xl bg-navy-950 border border-navy-800/80 shadow-md hover:shadow-xl hover:shadow-navy-950/20 hover:border-[#C5A059]/60 transition-all duration-300 select-none ${className}`}
    >
      <Image
        src={imageUrl}
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

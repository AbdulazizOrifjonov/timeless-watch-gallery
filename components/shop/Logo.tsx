import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  dark = false,
  hideTextOnMobile = false,
  className,
}: {
  dark?: boolean;
  hideTextOnMobile?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 sm:gap-3 shrink-0 group select-none", className)}>
      {/* Brand Emblem (Gold Monogram Medallion) */}
      <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2A160F] p-0.5 shadow-md border border-[#C5A059]/50 transition-all duration-300 group-hover:scale-105 group-hover:border-[#E8CE95] group-hover:shadow-[#C5A059]/20">
        <img
          src="/logo_emblem.png"
          alt="Timeless Logo"
          className="h-full w-full object-cover rounded-[10px]"
        />
      </div>

      {/* Brand Typography */}
      <div className={cn("flex flex-col leading-none", hideTextOnMobile ? "hidden sm:flex" : "flex")}>
        <span
          className={cn(
            "font-serif text-lg sm:text-2xl font-bold tracking-[0.12em] transition-colors duration-200",
            dark
              ? "text-white group-hover:text-[#D8B775]"
              : "text-[#2A160F] group-hover:text-[#5E3023]"
          )}
          style={{ letterSpacing: "0.14em" }}
        >
          TIMELESS
        </span>
        <span
          className={cn(
            "text-[8px] sm:text-[9.5px] font-semibold tracking-[0.25em] uppercase transition-colors duration-200 mt-0.5",
            dark
              ? "text-[#C5A059] group-hover:text-white"
              : "text-[#8C6D3B] group-hover:text-[#5E3023]"
          )}
        >
          The Watch Gallery
        </span>
      </div>
    </Link>
  );
}

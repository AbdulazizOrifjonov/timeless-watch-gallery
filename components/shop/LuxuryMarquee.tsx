"use client";

import React from "react";

const BRANDS = [
  "ROLEX",
  "PATEK PHILIPPE",
  "AUDEMARS PIGUET",
  "CARTIER",
  "OMEGA",
  "TAG HEUER",
  "HUBLOT",
  "TISSOT",
  "BREITLING",
  "IWC SCHAFFHAUSEN",
  "VACHERON CONSTANTIN",
  "LONGINES",
  "SEIKO",
  "CASIO EDIFICE",
];

export function LuxuryMarquee() {
  return (
    <section className="w-full bg-[#1C0D08] py-3.5 border-y border-[#C5A059]/30 overflow-hidden select-none shadow-sm">
      <div className="flex whitespace-nowrap animate-marquee">
        {BRANDS.map((brand, idx) => (
          <div key={`b1-${idx}`} className="flex items-center gap-5 mx-6 shrink-0">
            <span className="text-white/90 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase hover:text-[#D8B775] transition-colors">
              {brand}
            </span>
            <span className="text-[#C5A059] text-xs select-none">✦</span>
          </div>
        ))}
        {BRANDS.map((brand, idx) => (
          <div key={`b2-${idx}`} className="flex items-center gap-5 mx-6 shrink-0">
            <span className="text-white/90 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase hover:text-[#D8B775] transition-colors">
              {brand}
            </span>
            <span className="text-[#C5A059] text-xs select-none">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}

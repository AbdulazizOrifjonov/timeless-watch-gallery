"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Send, ArrowRight, Sparkles } from "lucide-react";
import { Slider } from "@/types/database";
import { DEFAULT_SLIDERS as DEFAULT_SLIDES } from "@/lib/default-data";

const TELEGRAM_ADMIN_URL = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_URL || "https://t.me";

export function HeroSlider({ sliders }: { sliders: Slider[] }) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const active = useMemo(() => {
    const list = sliders && sliders.length > 0 ? sliders : DEFAULT_SLIDES;
    const hasUnsplash = list.some((s) => s.image_url?.includes("unsplash.com") || !s.image_url);
    const finalList = hasUnsplash ? DEFAULT_SLIDES : list;
    return finalList
      .filter((s) => s.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [sliders]);

  useEffect(() => {
    if (active.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % active.length), 5500);
    return () => clearInterval(t);
  }, [active.length]);

  const handleNext = () => setIndex((i) => (i + 1) % active.length);
  const handlePrev = () => setIndex((i) => (i - 1 + active.length) % active.length);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-navy-950 text-white min-h-[340px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[460px] h-[46vh] max-h-[500px] select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {active.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        >
          {slide.image_url && (
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              priority={i === 0}
              className="object-cover object-center opacity-85 scale-105 transition-transform duration-[6000ms] ease-out"
            />
          )}

          {/* Vignette gradients: dark on left for text clarity, clear on right for watch visibility */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-navy-950/95 via-navy-950/65 to-navy-950/20" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-navy-950/85 via-transparent to-navy-950/35" />

          {/* Content */}
          <div className="container-shop relative flex h-full flex-col justify-center py-6 pointer-events-none">
            <div className="pointer-events-auto max-w-xl sm:max-w-2xl space-y-3 sm:space-y-4 z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/80 border border-[#C5A059]/60 px-3.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#D8B775] w-fit backdrop-blur-md shadow-xs">
                <span>⏱</span>
                <span>TIMELESS · THE WATCH GALLERY</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                {slide.title}
              </h1>

              {slide.subtitle && (
                <p className="max-w-lg text-xs sm:text-sm md:text-base text-white/95 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)] line-clamp-2 sm:line-clamp-3">
                  {slide.subtitle}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={slide.link ?? "/products"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-lg shadow-[#5E3023]/40 active:scale-95"
                >
                  <span>{slide.button_text || "Kolleksiyani ko'rish"}</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href={TELEGRAM_ADMIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/80 border border-[#C5A059]/40 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white/95 hover:bg-[#5E3023]/50 transition backdrop-blur-md shadow-md active:scale-95"
                >
                  <Send size={13} className="text-[#D8B775]" />
                  <span>Telegram Maslahat</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {active.length > 1 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Arrow Left (Desktop only to prevent mobile text overlap) */}
          <button
            onClick={handlePrev}
            aria-label="Oldingi slayd"
            className="hidden md:flex pointer-events-auto absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95 border border-white/20 shadow-md"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Arrow Right (Desktop only to prevent mobile text overlap) */}
          <button
            onClick={handleNext}
            aria-label="Keyingi slayd"
            className="hidden md:flex pointer-events-auto absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95 border border-white/20 shadow-md"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicator Pills */}
          <div className="pointer-events-auto absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {active.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Slayd ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 sm:w-8 bg-[#C5A059] shadow-xs" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


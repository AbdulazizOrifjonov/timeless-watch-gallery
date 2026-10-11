"use client";

import { usePathname } from "next/navigation";
import { Send } from "lucide-react";

const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/timless_watchgallery";

export function TelegramFloatingButton() {
  const pathname = usePathname();

  // Do not show on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href={TELEGRAM_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Rasmiy Telegram Kanalimiz"
      className="fixed bottom-[74px] md:bottom-6 right-4 z-40 group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5E3023] to-[#381A12] border border-[#C5A059]/40 text-white p-3 md:px-4 md:py-3 shadow-xl shadow-[#381A12]/40 hover:shadow-[#5E3023]/60 hover:scale-105 active:scale-95 transition-all duration-300"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]" />
      </span>
      <Send size={18} className="text-[#D8B775] shrink-0 -translate-x-0.5 translate-y-0.5" />
      <span className="hidden md:inline text-xs font-bold tracking-wider uppercase text-white">
        Telegram Gallery
      </span>
    </a>
  );
}

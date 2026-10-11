import Link from "next/link";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { Logo } from "./Logo";

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+998 97 555 55 17";
const CONTACT_TEL = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`;
const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/timless_watchgallery";
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/timeless_watchgallery?stkn=ZTA3OHh0cnR2bzUx&utm_source=qr";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white border-t-2 border-[#C5A059]">
      <div className="container-shop grid grid-cols-1 gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-1">
          <Logo dark />
          <p className="mt-4 text-xs text-white/65 leading-relaxed">
            Timeless — dunyoning yetakchi brendlaridan original, nufuzli va hashamatli soatlar galereyasi.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white tracking-wider text-sm uppercase">Kategoriyalar</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/categories/erkaklar-soatlari" className="hover:text-[#D8B775] transition">Erkaklar soatlari</Link></li>
            <li><Link href="/categories/ayollar-soatlari" className="hover:text-[#D8B775] transition">Ayollar soatlari</Link></li>
            <li><Link href="/categories/mexanik-soatlar" className="hover:text-[#D8B775] transition">Mexanik va Avtomatik</Link></li>
            <li><Link href="/categories/kvars-soatlari" className="hover:text-[#D8B775] transition">Kvars soatlari</Link></li>
            <li><Link href="/categories/shveytsariya-soatlari" className="hover:text-[#D8B775] transition">Shveytsariya soatlari</Link></li>
            <li><Link href="/categories/aksessuarlar" className="hover:text-[#D8B775] transition">Tasmalari va Aksessuarlar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white tracking-wider text-sm uppercase">Foydali havolalar</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/" className="hover:text-[#D8B775] transition">Bosh sahifa</Link></li>
            <li><Link href="/products?sale=1" className="hover:text-[#D8B775] transition">Aksiya va Chegirmalar</Link></li>
            <li><Link href="/about" className="hover:text-[#D8B775] transition">Galereya haqida</Link></li>
            <li><Link href="/delivery" className="hover:text-[#D8B775] transition">Yetkazib berish va Kafolat</Link></li>
            <li><Link href="/returns" className="hover:text-[#D8B775] transition">Qaytarish siyosati</Link></li>
            <li><Link href="/privacy" className="hover:text-[#D8B775] transition">Maxfiylik siyosati</Link></li>
            <li><Link href="/contact" className="hover:text-[#D8B775] transition">Aloqa</Link></li>
            <li><Link href="/admin" className="text-gold-400 hover:text-gold-300 font-medium">⚙️ Admin panel</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white tracking-wider text-sm uppercase">Aloqa</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <a href={CONTACT_TEL} className="flex items-center gap-2 hover:text-white transition font-medium text-white/90">
                <Phone size={15} className="text-[#C5A059] shrink-0" /> <span className="text-[#C5A059] font-bold">{CONTACT_PHONE}</span>
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-rose-300 hover:text-rose-200 transition font-medium"
              >
                <InstagramIcon size={15} className="shrink-0 text-rose-400" /> Instagram: @timeless_watchgallery
              </a>
            </li>
            <li>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#D8B775] hover:text-amber-200 transition font-medium"
              >
                <Send size={15} className="shrink-0 text-[#C5A059]" /> Telegram: @timless_watchgallery
              </a>
            </li>
            <li className="flex items-center gap-2"><Mail size={15} className="shrink-0 text-white/50" /> info@timeless.uz</li>
            <li className="flex items-center gap-2"><MapPin size={15} className="shrink-0 text-white/50" /> Toshkent, O'zbekiston</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white tracking-wider text-sm uppercase">Bizni kuzatib boring</h4>
          <div className="flex gap-3">
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5E3023] border border-[#C5A059]/40 text-white hover:bg-[#462016] transition shadow-xs"
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram Kanal"
              title="Rasmiy Telegram Kanal"
            >
              <Send size={15} className="text-[#D8B775]" />
            </a>
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white hover:opacity-90 transition shadow-xs"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5E3023] border border-[#C5A059]/40 text-white hover:bg-[#462016] transition shadow-xs"
              href={CONTACT_TEL}
              aria-label="Telefon"
              title={`Telefon: ${CONTACT_PHONE}`}
            >
              <Phone size={15} className="text-[#D8B775]" />
            </a>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/15 via-rose-500/20 to-purple-500/15 border border-rose-500/30 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500 hover:text-white transition"
            >
              <InstagramIcon size={13} className="text-rose-400" />
              <span>Instagram obuna bo'lish</span>
            </a>
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5E3023]/60 border border-[#C5A059]/30 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5E3023] hover:border-[#C5A059] transition"
            >
              <Send size={13} className="text-[#D8B775]" />
              <span>Telegram kanalga a'zo bo'lish</span>
            </a>
          </div>
          <p className="mt-4 font-serif text-xs italic text-[#D8B775]/90">
            &ldquo;Timeless — The Watch Gallery. Vaqt o'tadi, nafislik va mahorat mangu qoladi.&rdquo;
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shop flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 md:flex-row">
          <p>© 2025–2026 Timeless — The Watch Gallery. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4 text-sm font-bold tracking-wide">
            <span>VISA</span>
            <span className="text-gold-400">MasterCard</span>
            <span>UZCARD</span>
            <span className="text-gold-400">HUMO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

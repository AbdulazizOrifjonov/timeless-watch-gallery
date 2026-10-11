import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+998 97 555 55 17";
const CONTACT_TEL = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`;
const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/timless_watchgallery";
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/timeless_watchgallery?stkn=ZTA3OHh0cnR2bzUx&utm_source=qr";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Header active="/contact" />
      <div className="container-shop py-16 max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-navy-900 mb-8">Aloqa</h1>
        <div className="space-y-4 text-navy-900/80">
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-[#5E3023]" />
            <a href={CONTACT_TEL} className="font-semibold text-navy-900 hover:text-[#5E3023] transition">
              {CONTACT_PHONE}
            </a>
          </div>
          <div className="flex items-center gap-3"><Mail size={18} className="text-navy-900" /><span>info@timeless.uz</span></div>
          <div className="flex items-center gap-3"><MapPin size={18} className="text-navy-900" /><span>Toshkent, O'zbekiston</span></div>
          
          <div className="pt-2 flex flex-col gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 text-navy-950 hover:border-rose-400 transition shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                  <InstagramIcon size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-navy-900 group-hover:text-rose-600 transition-colors">Rasmiy Instagram Sahifamiz</div>
                  <div className="text-xs text-navy-900/60">Yangi modellar, foto va video-obzorlar (@timeless_watchgallery)</div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs">
                Sahifaga o'tish →
              </span>
            </a>

            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-[#C5A059]/40 text-navy-950 hover:border-[#5E3023] transition shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5E3023] text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-navy-900 group-hover:text-[#5E3023] transition-colors">Rasmiy Telegram Kanalimiz</div>
                  <div className="text-xs text-navy-900/60">Eksklyuziv soatlar katalogi va tezkor maslahat (@timless_watchgallery)</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#5E3023] bg-white px-3 py-1.5 rounded-lg border border-[#C5A059]/40 shadow-2xs">
                Kanalga o'tish →
              </span>
            </a>
          </div>
        </div>
        <form className="mt-10 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Ismingiz</label><input className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-[#5E3023]" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-[#5E3023]" /></div>
          <div><label className="block text-sm font-medium mb-1">Xabar</label><textarea rows={4} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-[#5E3023]" /></div>
          <button className="rounded-lg bg-[#5E3023] border border-[#C5A059]/40 px-6 py-3 text-sm font-bold text-white hover:bg-[#462016] transition shadow-md shadow-[#5E3023]/20">Yuborish</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

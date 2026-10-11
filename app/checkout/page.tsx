"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { YMaps, Map as YandexMap, Placemark } from "@pbe/react-yandex-maps";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatSom } from "@/lib/utils";

const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { products, createOrder } = useStore();
  const { user, ready: authReady } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
          setAddress("Geolokatsiya orqali belgilandi");
        },
        (error) => {
          alert("Joylashuvni aniqlashda xatolik yuz berdi. Iltimos, xaritadan o'zingiz belgilang.");
        }
      );
    } else {
      alert("Sizning brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi.");
    }
  };
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; min_order_amount: number } | null>(null);

  useEffect(() => {
    if (authReady && !user) {
      router.push("/login?redirect=checkout");
    }
  }, [authReady, user, router]);

  useEffect(() => {
    if (user) {
      if (user.fullName && !fullName) setFullName(user.fullName);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.address && !address) setAddress(user.address);
    }
  }, [user]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("gws_applied_promo");
      if (saved) {
        setAppliedPromo(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const detailed = useMemo(
    () =>
      items
        .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
        .filter((x) => x.product),
    [items, products]
  );

  const subtotal = useMemo(
    () => detailed.reduce((sum, x) => sum + x.product!.price * x.item.quantity, 0),
    [detailed]
  );
  const discountAmount = useMemo(
    () => (appliedPromo && subtotal >= appliedPromo.min_order_amount ? appliedPromo.discount : 0),
    [appliedPromo, subtotal]
  );
  const deliveryFee = useMemo(
    () => (subtotal >= 500000 || subtotal === 0 ? 0 : 30000),
    [subtotal]
  );
  const total = useMemo(
    () => Math.max(0, subtotal - discountAmount) + deliveryFee,
    [subtotal, discountAmount, deliveryFee]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (loading) return;
    
    if (!fullName || !phone || !address) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    if (detailed.length === 0) {
      setError("Savatchangiz bo'sh.");
      return;
    }
    
    setLoading(true);
    
    const siteOrigin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://uzoelektro.uz";

    const itemsData = detailed.map((d) => {
      const prod = d.product!;
      const prodImages: string[] = [];
      if (prod.image) prodImages.push(prod.image);
      if (Array.isArray(prod.images)) {
        for (const im of prod.images) {
          const u = typeof im === "string" ? im : (im as any)?.url;
          if (u && !prodImages.includes(u)) {
            prodImages.push(u);
          }
        }
      }
      // Har bir mahsulot uchun kamida 1 ta, ko'pi bilan 3 tagacha rasm
      const limitedImages = prodImages.slice(0, 3);
      const slug = prod.slug || prod.id;
      const productUrl = `${siteOrigin}/products/${encodeURIComponent(slug)}`;

      return {
        id: prod.id,
        name: prod.name,
        image: prod.image || limitedImages[0] || null,
        images: limitedImages,
        quantity: d.item.quantity,
        price: prod.price,
        slug: prod.slug,
        productUrl,
      };
    });

    const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ord_${Date.now()}`;

    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderNumber: orderNum,
          userId: user?.id ?? null,
          fullName,
          phone,
          address,
          location,
          note,
          items: itemsData,
          subtotal,
          discount: discountAmount,
          promoCode: appliedPromo?.code || null,
          total,
          deliveryFee
        })
      });
    } catch (err) {
      console.error("Failed to send order to telegram", err);
    }

    const order = createOrder({
      id: orderId,
      order_number: orderNum,
      user_id: user?.id ?? null,
      full_name: fullName,
      phone,
      address,
      note: note ? (appliedPromo ? `${note} (Promokod: ${appliedPromo.code})` : note) : (appliedPromo ? `Promokod: ${appliedPromo.code}` : null),
      subtotal,
      delivery_fee: deliveryFee,
      discount: discountAmount,
      total,
      items: detailed.map((d) => ({
        id: d.product!.id,
        order_id: orderId,
        product_id: d.product!.id,
        product_name: d.product!.name,
        product_image: d.product!.image,
        price: d.product!.price,
        quantity: d.item.quantity,
      })),
    });
    clear();
    try { sessionStorage.removeItem("gws_applied_promo"); } catch {}
    setPlacedOrder(order.order_number);
    setLoading(false);
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-white">
        <Header active="/products" />
        <div className="container-shop flex flex-col items-center py-24 text-center">
          <CheckCircle2 size={64} className="mb-6 text-success" />
          <h1 className="font-serif text-3xl font-bold text-navy-900">Buyurtmangiz qabul qilindi!</h1>
          <p className="mt-2 max-w-md text-navy-900/60">
            Buyurtma raqami: <span className="font-semibold text-navy-900">#{placedOrder}</span>. Tez orada operatorlarimiz siz bilan bog'lanadi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/orders" className="rounded-lg bg-navy-900 px-6 py-3 text-sm font-medium text-white">
              Buyurtmalarim
            </Link>
            <Link href="/products" className="rounded-lg border border-navy-100 px-6 py-3 text-sm font-medium">
              Xaridni davom ettirish
            </Link>
          </div>

          {/* Telegram Channel Community Invite */}
          <div className="mt-10 max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-sky-100/50 border border-sky-200/80 text-center shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0088cc]">VIP Jamiyat</p>
            <h3 className="text-base font-bold text-navy-900 mt-1">Rasmiy Telegram Kanalimizga qo'shiling</h3>
            <p className="text-xs text-navy-900/60 mt-1">
              Yangi kelgan asboblar, jonli video-obzorlar va faqat obunachilar uchun maxsus chegirmalar!
            </p>
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2298D6] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Telegram kanalga a'zo bo'lish 🚀
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />
      <div className="container-shop py-8">
        <h1 className="mb-6 font-serif text-3xl font-bold text-navy-900">Buyurtmani rasmiylashtirish</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4 rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-bold">Yetkazib berish ma'lumotlari</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">To'liq ism *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Ism Familiya"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefon raqam *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Manzil (yoki xaritadan belgilang) *</label>
              
              <div className="mb-3">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-navy-900 bg-navy-50 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-100"
                >
                  📍 Turgan joyimni aniqlash
                </button>
              </div>

              <div className="h-64 w-full overflow-hidden rounded-lg border border-navy-100 mb-3 relative z-0">
                <YMaps query={{ lang: "ru_RU" }}>
                  <YandexMap
                    defaultState={{ center: location || [41.2995, 69.2401], zoom: 12 }}
                    state={{ center: location || [41.2995, 69.2401], zoom: location ? 15 : 12 }}
                    width="100%"
                    height="100%"
                    onClick={(e: any) => {
                      const coords = e.get("coords");
                      setLocation(coords);
                      setAddress("Xaritadan belgilandi");
                    }}
                  >
                    {location && <Placemark geometry={location} />}
                  </YandexMap>
                </YMaps>
              </div>

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Shahar, tuman, ko'cha, uy raqami"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Qo'shimcha izoh</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Kuryerga izoh (ixtiyoriy)"
              />
            </div>
            <div className="rounded-lg bg-navy-50 p-3 text-xs text-navy-900/60">
              To'lov naqd yoki yetkazib berilganda amalga oshiriladi. Onlayn to'lov tizimi hozircha mavjud emas.
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>

          <aside className="h-fit space-y-4 rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-bold">Buyurtma tarkibi</h2>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {detailed.map(({ item, product }) => (
                <div key={item.productId} className="flex items-center gap-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                    {product!.image && <Image src={product!.image} alt="" fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product!.name}</p>
                    <p className="text-xs text-navy-900/50">{item.quantity} x {formatSom(product!.price)}</p>
                  </div>
                  <p className="font-semibold">{formatSom(product!.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-navy-100 pt-3 text-sm">
              <div className="flex justify-between"><span className="text-navy-900/60">Mahsulotlar</span><span>{formatSom(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-navy-900/60">Yetkazib berish</span><span>{deliveryFee ? formatSom(deliveryFee) : "Bepul"}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Chegirma ({appliedPromo?.code})</span>
                  <span>- {formatSom(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold"><span>Jami</span><span>{formatSom(total)}</span></div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#5E3023] py-3.5 text-sm font-bold text-white hover:bg-[#462016] border border-[#C5A059]/40 transition shadow-md shadow-[#5E3023]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
            </button>
          </aside>
        </form>
      </div>
      <Footer />
    </div>
  );
}






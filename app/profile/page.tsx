"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Camera, ChevronRight, MapPin, Pencil, Phone, Settings, CreditCard, Bell, HelpCircle, Heart } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useAuth } from "@/lib/auth";
import { useStore, fileToDataUrl } from "@/lib/store";
import { formatSom, cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+998 90 000 00 00";
const CONTACT_TEL = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`;

export default function ProfilePage() {
  const { user, ready, updateProfile } = useAuth();
  const { orders, profileSidebarOpen } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "info";
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && !user) router.push("/login");
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setAddress(user.address ?? "");
    }
  }, [ready, user, router]);

  if (!user) return null;

  const myOrders = orders.filter((o) => o.user_id === user.id).slice(0, 4);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      updateProfile({ profileImage: dataUrl });
      showToast("Profil rasmi yangilandi", "success");
    } catch {
      showToast("Rasm yuklashda xatolik yuz berdi", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header active="/profile" isAuthed />

      <main className="flex-1">
        <div className={cn("container-shop grid gap-8 pb-16 transition-all duration-500 ease-in-out", profileSidebarOpen ? "grid-cols-1 lg:grid-cols-[280px_1fr]" : "grid-cols-1 lg:grid-cols-[0px_1fr] lg:gap-0 max-w-5xl pt-8")}>
          
          <div className={cn("pt-8 transition-all duration-500 ease-in-out", profileSidebarOpen ? "lg:border-r lg:border-navy-100 lg:pr-8 opacity-100" : "opacity-0 border-transparent pr-0 pointer-events-none")}>
            <div className="w-[248px] h-full">
              <AccountSidebar />
            </div>
          </div>

          <div className={cn(profileSidebarOpen && "pt-8")}>
            {currentTab === "info" && (
              <section id="info" className="space-y-12">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-navy-900">Profil</h1>
                  <p className="mb-6 text-sm text-navy-900/50">Shaxsiy ma'lumotlaringizni boshqaring</p>

                  <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy-100 p-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-navy-100 text-navy-900 shadow-sm transition hover:ring-4 hover:ring-navy-50"
                        onClick={() => fileInputRef.current?.click()}
                        title="Profil rasmini o'zgartirish"
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-full">
                          {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.fullName} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-navy-900/50">
                              {user.fullName.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-navy-900 text-white shadow-md">
                          <Camera size={14} />
                        </div>
                      </div>
                      <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleImageUpload} />
                      <div>
                        <p className="text-lg font-bold text-navy-900">{user.fullName}</p>
                        <p className="text-sm text-navy-900/50">{user.phone}</p>
                        <span className="mt-1 inline-block rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-900/60">
                          {user.role === "admin" || user.role === "super_admin" ? "Admin" : "Mijoz"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing((v) => !v)}
                      className="flex items-center gap-2 rounded-lg border border-navy-100 px-4 py-2 text-sm font-medium hover:bg-navy-50"
                    >
                      <Pencil size={14} /> Profilni tahrirlash
                    </button>
                  </div>

                  {editing && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateProfile({ fullName, phone, address });
                        setEditing(false);
                        showToast("Ma'lumotlar muvaffaqiyatli saqlandi", "success");
                      }}
                      className="mb-8 space-y-4 rounded-xl border border-navy-100 p-6"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium">To'liq ism</label>
                          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Telefon</label>
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-sm font-medium">Manzil</label>
                          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
                        </div>
                      </div>
                      <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white">Saqlash</button>
                    </form>
                  )}

                  <div className="mb-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-xl border border-navy-100 p-4">
                      <Phone size={16} className="text-navy-900/50" />
                      <div>
                        <p className="text-navy-900/50">Telefon raqam</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-navy-100 p-4">
                      <MapPin size={16} className="text-navy-900/50" />
                      <div>
                        <p className="text-navy-900/50">Asosiy manzil</p>
                        <p className="font-medium">{user.address || "Kiritilmagan"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-navy-100 p-4">
                      <div>
                        <p className="text-navy-900/50">Ro'yxatdan o'tgan sana</p>
                        <p className="font-medium">{new Date(user.createdAt).toLocaleDateString("uz-UZ")}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex items-center justify-between mt-12">
                    <h2 className="text-xl font-bold text-navy-900">So'nggi buyurtmalar</h2>
                    <Link href="/orders" className="text-sm font-medium text-info hover:underline">
                      Barchasini ko'rish →
                    </Link>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-navy-100 py-10 text-center text-navy-900/50">
                      Hali buyurtma bermagansiz.
                    </div>
                  ) : (
                    <div className="divide-y divide-navy-100 rounded-xl border border-navy-100 bg-white">
                      {myOrders.map((o) => (
                        <Link
                          key={o.id}
                          href={`/orders/${o.id}`}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm hover:bg-navy-50 transition"
                        >
                          <div>
                            <p className="font-semibold text-navy-900">#{o.order_number}</p>
                            <p className="text-navy-900/50 mt-0.5">{new Date(o.created_at).toLocaleDateString("uz-UZ")}</p>
                          </div>
                          <p className="text-navy-900/60 hidden sm:block">{o.items?.length ?? 0} ta mahsulot</p>
                          <p className="font-semibold">{o.total.toLocaleString("ru-RU")} so'm</p>
                          <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-900">
                            {o.status === 'new' ? 'Yangi' : o.status === 'processing' ? 'Jarayonda' : o.status === 'shipped' ? 'Yetkazilmoqda' : o.status === 'delivered' ? 'Yetkazilgan' : 'Bekor qilingan'}
                          </span>
                          <ChevronRight size={16} className="text-navy-900/30" />
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Link href="/wishlist" className="flex items-center justify-between rounded-xl border border-navy-100 p-5 hover:border-gold-500 hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-danger">
                          <Heart size={20} fill="currentColor" />
                        </div>
                        <div>
                          <p className="font-bold text-navy-900">Sevimlilar</p>
                          <p className="text-xs text-navy-900/50">Saqlangan mahsulotlaringiz</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-navy-900/30" />
                    </Link>
                    <Link href="/profile?tab=address" className="flex items-center justify-between rounded-xl border border-navy-100 p-5 hover:border-gold-500 hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-900">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-navy-900">Manzillarim</p>
                          <p className="text-xs text-navy-900/50">Yetkazib berish manzillari</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-navy-900/30" />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {currentTab === "address" && (
              <section id="address">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-navy-900" size={24} />
                  <h2 className="font-serif text-3xl font-bold text-navy-900">Manzillar</h2>
                </div>
                <div className="rounded-xl border border-navy-100 p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900">Asosiy manzil</p>
                    <p className="text-sm text-navy-900/50 mt-1">{user.address || "Hali manzil kiritilmagan. Asosiy ma'lumotlar orqali tahrirlashingiz mumkin."}</p>
                  </div>
                  <Link href="/profile" className="text-sm font-medium text-info">Tahrirlash</Link>
                </div>
              </section>
            )}

            {currentTab === "payment" && (
              <section id="payment">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-navy-900" size={24} />
                  <h2 className="font-serif text-3xl font-bold text-navy-900">To'lov usullari</h2>
                </div>
                <div className="rounded-xl border border-dashed border-navy-100 py-10 text-center text-navy-900/50">
                  Hozircha saqlangan kartalar mavjud emas. Buyurtma paytida karta qo'shishingiz mumkin.
                </div>
              </section>
            )}

            {currentTab === "notifications" && (
              <section id="notifications">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-navy-900" size={24} />
                  <h2 className="font-serif text-3xl font-bold text-navy-900">Bildirishnomalar</h2>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-navy-50 p-4">
                    <p className="font-semibold text-navy-900">Xush kelibsiz!</p>
                    <p className="text-sm text-navy-900/60 mt-1">Timeless — The Watch Gallery profiliga xush kelibsiz. Eng sifatli elektr asboblari va qurilish jihozlari faqat bizda.</p>
                  </div>
                </div>
              </section>
            )}

            {currentTab === "settings" && (
              <section id="settings">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="text-navy-900" size={24} />
                  <h2 className="font-serif text-3xl font-bold text-navy-900">Sozlamalar</h2>
                </div>
                <div className="rounded-xl border border-navy-100 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-navy-50 pb-6">
                    <div>
                      <p className="font-semibold text-navy-900">Email xabarnomalar</p>
                      <p className="text-sm text-navy-900/50">Aksiyalar va yangiliklardan xabardor bo'ling</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="peer h-6 w-11 rounded-full bg-navy-100 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-danger">Profilni o'chirish</p>
                      <p className="text-sm text-navy-900/50">Barcha ma'lumotlaringiz o'chib ketadi</p>
                    </div>
                    <button className="text-sm font-medium text-danger hover:underline">O'chirish</button>
                  </div>
                </div>
              </section>
            )}

            {currentTab === "help" && (
              <section id="help">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="text-navy-900" size={24} />
                  <h2 className="font-serif text-3xl font-bold text-navy-900">Yordam</h2>
                </div>
                <div className="rounded-xl border border-navy-100 p-6">
                  <p className="text-sm text-navy-900/70 mb-4">Agar sizda savollar tug'ilsa yoki yordam kerak bo'lsa, bizning qo'llab-quvvatlash xizmatiga murojaat qiling.</p>
                  <div className="flex items-center gap-4">
                    <a href={CONTACT_TEL} className="flex items-center gap-2 rounded-lg bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 px-4 py-2 text-sm font-bold text-white transition shadow-xs">
                      <Phone size={16} /> {CONTACT_PHONE}
                    </a>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}




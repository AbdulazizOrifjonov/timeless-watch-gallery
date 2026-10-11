"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  FileText,
  Clock3,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useStore } from "@/lib/store";
import { useToast } from "@/context/ToastContext";
import { OrderStatus } from "@/types/database";
import { formatSom } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["new", "processing", "shipped", "delivered", "cancelled"];
const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Yangi",
  processing: "Tasdiqlangan",
  shipped: "Yuborilgan",
  delivered: "Yetkazib berildi",
  cancelled: "Bekor qilingan",
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orders, products, updateOrderStatus } = useStore();
  const { showToast } = useToast();
  const router = useRouter();

  const order = orders.find((o) => o.id === id || o.order_number === id);

  function handleStatusChange(newStatus: OrderStatus) {
    if (!order) return;
    updateOrderStatus(order.id, newStatus);
    showToast(`Buyurtma holati "${STATUS_LABEL[newStatus]}"ga o'zgartirildi`, "success");
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-navy-50/50 pb-20">
        <AdminHeader title="Buyurtma tafsilotlari" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-navy-200/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-navy-800 hover:bg-navy-50 transition shadow-2xs mb-6"
          >
            <ArrowLeft size={16} />
            <span>Buyurtmalar ro'yxatiga qaytish</span>
          </Link>

          <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-400">
              <Package size={32} />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Buyurtma topilmadi</h2>
            <p className="text-sm text-navy-900/50 mb-6">
              Bunday ID yoki raqamdagi buyurtma mavjud emas yoki o'chirilgan bo'lishi mumkin.
            </p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition"
            >
              Buyurtmalar ro'yxatiga o'tish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cleanPhone = order.phone.replace(/[^\d+]/g, "");
  const telegramPhone = order.phone.replace(/[^\d]/g, "");

  const items = order.items || [];
  const totalItemsCount = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  return (
    <div className="min-h-screen bg-navy-50/50 pb-20">
      <AdminHeader
        title={`Buyurtma #${order.order_number}`}
        subtitle="Buyurtma tafsilotlari, mahsulotlar va mijoz ma'lumotlari"
      />

      <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Yuqori Navigatsiya va Status paneli */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-navy-100/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200/80 bg-navy-50 text-navy-800 hover:bg-navy-100 transition active:scale-95 touch-target"
              title="Ro'yxatga qaytish"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-navy-950 text-lg sm:text-xl tracking-tight">
                  #{order.order_number}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="flex items-center gap-1 text-[11px] sm:text-xs text-navy-900/50 mt-0.5">
                <Clock size={12} />
                <span>
                  {new Date(order.created_at).toLocaleString("uz-UZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          </div>

          {/* Holatni o'zgartirish tezkor boshqaruvi */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-navy-50">
            <span className="text-xs font-semibold text-navy-900/60">Holat:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="rounded-xl border border-navy-200/90 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-navy-900 outline-none hover:border-navy-400 focus:ring-2 focus:ring-navy-900/10 transition cursor-pointer shadow-2xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Asosiy Kontent: 2 ustunli tartib */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* CHAP USTUN: Xarid qilingan barcha mahsulotlar (Har biri alohida karta) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-bold text-navy-950 flex items-center gap-2">
                <Package size={20} className="text-navy-900" />
                <span>Xarid qilingan mahsulotlar ({items.length} xil / {totalItemsCount} dona)</span>
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-navy-900/50">
                Ushbu buyurtmada mahsulotlar ma'lumoti topilmadi.
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item, idx) => {
                  const prod = products.find(
                    (p) =>
                      p.id === item.product_id ||
                      (item.product_name && p.name.toLowerCase() === item.product_name.toLowerCase())
                  );

                  const itemName = item.product_name || (item as any).name || "Nomsiz mahsulot";
                  const itemImage =
                    item.product_image ||
                    (item as any).image ||
                    prod?.image ||
                    (prod?.images && prod.images[0]?.url) ||
                    null;
                  const itemPrice = Number(item.price || 0);
                  const itemQty = Number(item.quantity || 1);
                  const itemTotal = itemPrice * itemQty;
                  const itemSlug = prod?.slug || (item as any).slug || item.product_id;

                  // Mahsulotning barcha qo'shimcha rasmlari (agar bo'lsa)
                  const extraImages: string[] = [];
                  if (itemImage) extraImages.push(itemImage);
                  if (prod && Array.isArray(prod.images)) {
                    for (const im of prod.images) {
                      const u = typeof im === "string" ? im : im?.url;
                      if (u && !extraImages.includes(u)) extraImages.push(u);
                    }
                  }

                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-5 shadow-2xs hover:border-navy-200 transition-all space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Katta rasm */}
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-navy-50 border border-navy-100 shadow-2xs">
                          {itemImage ? (
                            <Image
                              src={itemImage}
                              alt={itemName}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-navy-400 font-medium">
                              Rasm yo'q
                            </div>
                          )}
                          <span className="absolute left-1.5 top-1.5 rounded-md bg-navy-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Mahsulot ma'lumotlari */}
                        <div className="flex-1 min-w-0 space-y-1.5 w-full">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-navy-950 leading-snug">
                                {itemName}
                              </h3>
                              {prod?.brand && (
                                <span className="inline-block rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-900/70 mt-1 border border-navy-100/60">
                                  {prod.brand}
                                </span>
                              )}
                            </div>

                            {/* Saytdagi sahifaga o'tish tugmasi */}
                            {itemSlug && (
                              <Link
                                href={`/products/${itemSlug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200/80 bg-navy-50/70 px-2.5 py-1 text-[11px] font-semibold text-navy-800 hover:bg-navy-900 hover:text-white transition shadow-2xs shrink-0"
                              >
                                <span>Saytda ko'rish</span>
                                <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>

                          {/* Narx va Soni hisob-kitobi */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-navy-50 text-xs">
                            <div className="rounded-lg bg-navy-50/60 p-2">
                              <span className="text-navy-900/50 block text-[10px] uppercase font-bold tracking-wider">
                                Xarid soni:
                              </span>
                              <span className="font-extrabold text-navy-950 text-sm">
                                {itemQty} dona
                              </span>
                            </div>

                            <div className="rounded-lg bg-navy-50/60 p-2">
                              <span className="text-navy-900/50 block text-[10px] uppercase font-bold tracking-wider">
                                Donasi narxi:
                              </span>
                              <span className="font-bold text-navy-900 text-xs sm:text-sm">
                                {formatSom(itemPrice)}
                              </span>
                            </div>

                            <div className="rounded-lg bg-navy-900/5 p-2 col-span-2 sm:col-span-1 border border-navy-900/10">
                              <span className="text-navy-900/60 block text-[10px] uppercase font-bold tracking-wider">
                                Jami summasi:
                              </span>
                              <span className="font-extrabold text-navy-950 text-sm sm:text-base text-emerald-900">
                                {formatSom(itemTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agar mahsulotda 2 yoki 3 ta rasm bo'lsa, miniatyuralar */}
                      {extraImages.length > 1 && (
                        <div className="pt-2 border-t border-navy-50/80 flex items-center gap-2 overflow-x-auto pb-1">
                          <span className="text-[10px] font-bold text-navy-900/40 uppercase tracking-wider shrink-0">
                            Barcha rasmlari ({extraImages.length}):
                          </span>
                          {extraImages.slice(0, 4).map((src, imgIdx) => (
                            <a
                              key={imgIdx}
                              href={src}
                              target="_blank"
                              rel="noreferrer"
                              className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-navy-100 hover:scale-105 transition"
                            >
                              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* O'NG USTUN: Mijoz ma'lumotlari & To'lov xulosasi (Qotirilgan / Sticky panel) */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-0.5">
            {/* 1. Mijoz Ma'lumotlari Kartasi */}
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-navy-50 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100/60 text-navy-900">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-sm">Mijoz ma'lumotlari</h3>
                  <p className="text-[11px] text-navy-900/50">Buyurtmachi haqida to'liq kontakt</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-navy-900/50 block">Mijoz ismi:</span>
                  <span className="font-bold text-navy-900 text-sm sm:text-base">
                    {order.full_name}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-navy-900/50 block">Telefon raqam:</span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white hover:bg-navy-800 transition active:scale-95 shadow-xs"
                    >
                      <Phone size={13} />
                      <span>{order.phone}</span>
                    </a>

                    {telegramPhone && (
                      <a
                        href={`https://t.me/+${telegramPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#2AABEE]/40 bg-[#2AABEE]/10 px-3 py-2 text-xs font-bold text-[#0088cc] hover:bg-[#2AABEE] hover:text-white transition active:scale-95 shadow-xs"
                      >
                        <Send size={13} />
                        <span>Telegram</span>
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-navy-900/50 block">Yetkazib berish manzili:</span>
                  <div className="flex items-start gap-1.5 mt-1 rounded-xl bg-navy-50/70 p-2.5 text-xs text-navy-900 border border-navy-100/60">
                    <MapPin size={15} className="text-danger shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{order.address}</span>
                  </div>
                </div>

                {order.note && (
                  <div>
                    <span className="text-[11px] font-semibold text-navy-900/50 block">Mijoz izohi:</span>
                    <div className="flex items-start gap-1.5 mt-1 rounded-xl bg-amber-50/80 p-2.5 text-xs text-amber-950 border border-amber-200/70">
                      <FileText size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{order.note}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Moliyaviy Xulosa Kartasi */}
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 border-b border-navy-50 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-sm">To'lov xulosasi</h3>
                  <p className="text-[11px] text-navy-900/50">Hisob-kitob va jami summa</p>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-navy-900/70">
                  <span>Oraliq summa ({totalItemsCount} dona):</span>
                  <span className="font-semibold text-navy-900">{formatSom(order.subtotal || order.total)}</span>
                </div>

                <div className="flex justify-between text-navy-900/70">
                  <span>Yetkazib berish:</span>
                  <span className={order.delivery_fee ? "font-semibold text-navy-900" : "font-semibold text-emerald-600"}>
                    {order.delivery_fee ? formatSom(order.delivery_fee) : "Bepul"}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Chegirma:</span>
                    <span>-{formatSom(order.discount)}</span>
                  </div>
                )}

                <div className="border-t border-navy-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-navy-900/60 block uppercase tracking-wider">
                      Jami to'lov:
                    </span>
                    <span className="text-[10px] text-navy-900/40">Naqd yoki karta orqali</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-extrabold text-navy-950">
                    {formatSom(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Tezkor Status o'zgartirish tugmalari */}
            <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-navy-900/60 block uppercase tracking-wider mb-2">
                Tezkor amallar:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleStatusChange("processing")}
                  className="rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-sky-800 hover:bg-sky-100 active:scale-95 transition text-center"
                >
                  Tasdiqlash
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("shipped")}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-indigo-800 hover:bg-indigo-100 active:scale-95 transition text-center"
                >
                  Yuborish 🚚
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("delivered")}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition text-center"
                >
                  Yetkazildi ✅
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("cancelled")}
                  className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-rose-800 hover:bg-rose-100 active:scale-95 transition text-center"
                >
                  Bekor qilish ❌
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useStore } from "@/lib/store";
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

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Buyurtma qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Buyurtmalar</h1>
            <p className="text-sm text-navy-900/50">Barcha buyurtmalarni ko'rish va holatini boshqarish</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
            <option value="all">Barcha holatlar</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>

        {/* MOBIL KO'RINISH: Telefonlar uchun Buyurtmalar kartalari */}
        <div className="md:hidden space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-xl border border-navy-100 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-navy-950 text-sm">#{o.order_number}</span>
                  <span className="text-[11px] text-navy-900/50 ml-2">
                    {new Date(o.created_at).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <div className="rounded-lg bg-navy-50/60 p-2.5 text-xs space-y-1">
                <p className="font-semibold text-navy-900">{o.full_name}</p>
                <p className="text-navy-900/60">{o.phone}</p>
                <p className="text-navy-900/60 truncate">{o.address}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-navy-900/40 block">Jami summa:</span>
                  <span className="font-bold text-navy-950 text-sm">{formatSom(o.total)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="rounded-lg border border-navy-200/80 bg-white px-2 py-1.5 text-xs font-medium text-navy-900 outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>

                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-navy-200/80 bg-navy-50 px-2.5 text-xs font-semibold text-navy-800 hover:bg-navy-100 active:scale-95 transition"
                  >
                    <Eye size={13} />
                    <span>Ko'rish</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-navy-100 bg-white p-8 text-center text-sm text-navy-900/40">
              Buyurtma topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL: Katta ekranlar uchun */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Mijoz</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Manzil</th>
                <th className="p-3">Summa</th>
                <th className="p-3">Sana</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="p-3 font-medium text-navy-900">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline hover:text-gold-600">
                      #{o.order_number}
                    </Link>
                  </td>
                  <td className="p-3">{o.full_name}</td>
                  <td className="p-3">{o.phone}</td>
                  <td className="p-3 max-w-[180px] truncate">{o.address}</td>
                  <td className="p-3 font-semibold">{formatSom(o.total)}</td>
                  <td className="p-3 text-navy-900/50">{new Date(o.created_at).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-navy-100 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50 text-navy-700 hover:text-navy-950 transition"
                      title="Batafsil ko'rish"
                    >
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-navy-900/40">Buyurtma topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


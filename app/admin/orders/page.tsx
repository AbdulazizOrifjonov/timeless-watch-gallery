"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, RotateCw, ShoppingBag, Clock, DollarSign, Search } from "lucide-react";
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
  const { orders, updateOrderStatus, refreshOrders } = useStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" ? true : o.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesStatus;
    const matchesQuery =
      o.order_number.toLowerCase().includes(query) ||
      o.full_name.toLowerCase().includes(query) ||
      o.phone.toLowerCase().includes(query) ||
      (o.address && o.address.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const newOrdersCount = orders.filter((o) => o.status === "new").length;

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Buyurtma qidirish..." />
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Yuqori sarlavha va yangilash tugmasi */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">Buyurtmalar</h1>
            <p className="text-xs sm:text-sm text-navy-900/50">Barcha buyurtmalarni ko'rish va holatini boshqarish</p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy-800 shadow-2xs hover:bg-navy-50 active:scale-95 transition"
          >
            <RotateCw size={15} className={isRefreshing ? "animate-spin text-[#5E3023]" : "text-navy-600"} />
            <span>Yangilash</span>
          </button>
        </div>

        {/* Statistika kartalari */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-[#D8B775] shadow-xs">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs text-navy-500 font-medium">Jami buyurtmalar</p>
              <p className="text-xl font-bold text-navy-950 mt-0.5">{orders.length} ta</p>
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-navy-500 font-medium">Yangi buyurtmalar</p>
              <p className="text-xl font-bold text-navy-950 mt-0.5">{newOrdersCount} ta</p>
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5E3023] text-[#D8B775] shadow-xs">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-navy-500 font-medium">Jami aylanma</p>
              <p className="text-xl font-bold text-navy-950 mt-0.5">{formatSom(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Qidiruv va Filtr */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raqam, mijoz ismi yoki telefon bo'yicha..."
              className="w-full rounded-xl border border-navy-100 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-navy-900 shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-navy-100 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-navy-800 outline-none shadow-2xs"
          >
            <option value="all">Barcha holatlar ({orders.length})</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]} ({orders.filter((o) => o.status === s).length})
              </option>
            ))}
          </select>
        </div>

        {/* MOBIL KO'RINISH: Telefonlar uchun Buyurtmalar kartalari */}
        <div className="md:hidden space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-navy-950 text-sm">#{o.order_number}</span>
                  <span className="text-[11px] text-navy-900/50 ml-2">
                    {new Date(o.created_at).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <div className="rounded-xl bg-navy-50/70 p-3 text-xs space-y-1">
                <p className="font-semibold text-navy-900">{o.full_name}</p>
                <p className="text-navy-900/70">{o.phone}</p>
                <p className="text-navy-900/70 truncate">{o.address}</p>
                {o.note && (
                  <p className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] mt-1">
                    Izoh: {o.note}
                  </p>
                )}
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
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
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
            <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-navy-900/40">
              Buyurtma topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL: Katta ekranlar uchun */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] border-b border-navy-100 text-xs text-navy-900/60 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 font-bold"># Raqam</th>
                <th className="p-3.5 font-bold">Mijoz</th>
                <th className="p-3.5 font-bold">Telefon</th>
                <th className="p-3.5 font-bold">Manzil</th>
                <th className="p-3.5 font-bold">Summa</th>
                <th className="p-3.5 font-bold">Sana</th>
                <th className="p-3.5 font-bold">Holat</th>
                <th className="p-3.5 text-right font-bold">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="p-3.5 font-bold text-navy-900">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline hover:text-[#5E3023]">
                      #{o.order_number}
                    </Link>
                  </td>
                  <td className="p-3.5 font-medium text-navy-900">{o.full_name}</td>
                  <td className="p-3.5 text-navy-700">{o.phone}</td>
                  <td className="p-3.5 max-w-[200px] truncate text-navy-600" title={o.address}>
                    {o.address}
                  </td>
                  <td className="p-3.5 font-bold text-navy-950">{formatSom(o.total)}</td>
                  <td className="p-3.5 text-navy-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString("uz-UZ", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3.5">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-navy-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-navy-900"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 hover:bg-navy-50 text-navy-800 text-xs font-semibold shadow-2xs transition"
                      title="Batafsil ko'rish"
                    >
                      <Eye size={13} />
                      <span>Ko'rish</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-navy-900/40">
                    Buyurtma topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

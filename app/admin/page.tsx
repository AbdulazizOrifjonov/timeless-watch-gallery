"use client";

import {
  ShoppingCart,
  Package,
  Users,
  Layers,
  Tag,
  BarChart3,
  Eye,
  ImagePlus,
  PlusCircle,
  Tag as TagIcon,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useStore } from "@/lib/store";
import { formatSom } from "@/lib/utils";

const SALES_TREND = [
  { date: "1", sales: 12000000 }, { date: "3", sales: 15000000 }, { date: "5", sales: 13500000 },
  { date: "7", sales: 18000000 }, { date: "9", sales: 21000000 }, { date: "11", sales: 19000000 },
  { date: "13", sales: 25000000 }, { date: "15", sales: 22000000 }, { date: "17", sales: 27000000 },
  { date: "19", sales: 24000000 }, { date: "21", sales: 30000000 }, { date: "23", sales: 28000000 },
  { date: "25", sales: 32000000 }, { date: "27", sales: 29000000 }, { date: "29", sales: 34000000 },
];

const CATEGORY_COLORS = ["#0b1c33", "#2563eb", "#c8a45e", "#94a3b8", "#1f9d55", "#8b5cf6"];

export default function AdminDashboardPage() {
  const { products, orders, categories } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCustomers = new Set(orders.map((o) => o.user_id).filter(Boolean)).size || 892;
  const saleProducts = products.filter((p) => p.discount || (p.old_price && p.old_price > p.price));

  const categoryBreakdown = categories
    .map((c) => ({
      name: c.name,
      value: products.filter((p) => p.category_id === c.id).length,
    }))
    .filter((c) => c.value > 0);

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Boshqaruv paneli</h1>
            <p className="text-sm text-navy-900/50">Do'koningiz haqidagi umumiy ma'lumotlar va statistikalar</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={ShoppingCart} label="Jami buyurtmalar" value={orders.length} change="+12%" color="bg-info" />
          <StatCard icon={Package} label="Jami mahsulotlar" value={products.length} change="+8%" color="bg-success" />
          <StatCard icon={Users} label="Jami mijozlar" value={totalCustomers} change="+15%" color="bg-purple-600" />
          <StatCard icon={Layers} label="Jami kategoriyalar" value={categories.length} change="+20%" color="bg-orange-500" />
          <StatCard icon={Tag} label="Aksiya mahsulotlar" value={saleProducts.length} change="+40%" color="bg-danger" />
          <StatCard icon={BarChart3} label="Umumiy daromad" value={formatSom(totalRevenue)} change="+18%" color="bg-info" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-navy-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-navy-900">Sotuvlar va Buyurtmalar statistikasi</h2>
              <select className="rounded-lg border border-navy-100 px-2 py-1 text-xs">
                <option>Oxirgi 30 kun</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={SALES_TREND}>
                <CartesianGrid stroke="#e7ecf3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip formatter={(v, name) => name === 'sales' ? formatSom(Number(v)) : v + " ta buyurtma"} />
                <Line yAxisId="left" name="Sotuvlar" type="monotone" dataKey="sales" stroke="#0b1c33" strokeWidth={2} dot={false} />
                <Line yAxisId="right" name="Buyurtmalar" type="monotone" dataKey={(d) => Math.floor(d.sales / 1000000)} stroke="#c8a45e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-navy-100 p-5">
            <h2 className="mb-4 font-bold text-navy-900">Kategoriya bo'yicha mahsulotlar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5 text-xs">
              {categoryBreakdown.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {c.name}
                  </span>
                  <span className="font-medium">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-navy-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-navy-900">So'nggi buyurtmalar</h2>
              <Link href="/admin/orders" className="text-sm text-navy-900/60 hover:text-gold-500">Barchasini ko'rish →</Link>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-navy-900/40">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Mijoz</th>
                  <th className="pb-2 font-medium">Summa</th>
                  <th className="pb-2 font-medium">Holat</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-navy-50">
                    <td className="py-3 font-medium">#{o.order_number}</td>
                    <td className="py-3">{o.full_name}</td>
                    <td className="py-3">{formatSom(o.total)}</td>
                    <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="py-3">
                      <Link href={`/admin/orders`} className="text-navy-900/40 hover:text-navy-900"><Eye size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-navy-100 p-5">
              <h2 className="mb-4 font-bold text-navy-900">Tezkor amallar</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/admin/products" className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 py-4 hover:bg-navy-50">
                  <PlusCircle size={18} /> Yangi mahsulot
                </Link>
                <Link href="/admin/categories" className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 py-4 hover:bg-navy-50">
                  <Layers size={18} /> Yangi kategoriya
                </Link>
                <Link href="/admin/sliders" className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 py-4 hover:bg-navy-50">
                  <ImagePlus size={18} /> Yangi slider
                </Link>
                <Link href="/admin/promocodes" className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 py-4 hover:bg-navy-50">
                  <Ticket size={18} /> Promokodlar
                </Link>
                <Link href="/admin/sale" className="flex flex-col items-center gap-2 rounded-lg border border-navy-100 py-4 hover:bg-navy-50">
                  <TagIcon size={18} /> Aksiya qo'shish
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-navy-900 p-5 text-white">
              <p className="font-semibold">Sizning do'koningiz dunyoga yaqinroq!</p>
              <p className="mt-1 text-sm text-white/60">Timeless — The Watch Gallery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


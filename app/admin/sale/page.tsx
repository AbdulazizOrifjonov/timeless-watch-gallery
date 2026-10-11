"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Tag, ShoppingCart, Clock, BarChart3, Pencil, Trash2, Eye, Gift } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { useStore } from "@/lib/store";
import { Product } from "@/types/database";
import { formatSom, calcDiscount } from "@/lib/utils";

export default function AdminSalePage() {
  const { products, categories, updateProduct } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [oldPrice, setOldPrice] = useState("");
  const [price, setPrice] = useState("");

  const saleProducts = useMemo(
    () => products.filter((p) => p.old_price && p.old_price > p.price),
    [products]
  );

  const avgDiscount =
    saleProducts.length > 0
      ? Math.round(
          saleProducts.reduce((sum, p) => sum + calcDiscount(p.price, p.old_price), 0) / saleProducts.length
        )
      : 0;

  function openEdit(p: Product) {
    setEditing(p);
    setOldPrice(p.old_price ? String(p.old_price) : String(p.price));
    setPrice(String(p.price));
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    updateProduct(editing.id, { old_price: Number(oldPrice), price: Number(price) });
    setModalOpen(false);
  }

  function removeSale(p: Product) {
    updateProduct(p.id, { old_price: null, discount: null });
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Mahsulot qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Aksiya mahsulotlar</h1>
            <p className="text-sm text-navy-900/50">Chegirmali mahsulotlarni boshqarish, qo'shish va tahrirlash</p>
          </div>
          <a href="/admin/products" className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Tag size={16} /> Yangi aksiya qo'shish
          </a>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Tag} label="Jami aksiya mahsulotlar" value={saleProducts.length} change="+6" color="bg-danger" />
          <StatCard icon={ShoppingCart} label="Faol aksiyalar" value={saleProducts.filter((p) => p.is_active).length} change="+5" color="bg-success" />
          <StatCard icon={Clock} label="Tugash arafasidagi" value={Math.min(4, saleProducts.length)} change="+1" color="bg-orange-500" />
          <StatCard icon={BarChart3} label="O'rtacha chegirma" value={`${avgDiscount}%`} change="+5%" color="bg-purple-600" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Mahsulot nomi</th>
                <th className="p-3">Kategoriya</th>
                <th className="p-3">Oddiy narx</th>
                <th className="p-3">Aksiya narxi</th>
                <th className="p-3">Chegirma</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {saleProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                const discount = calcDiscount(p.price, p.old_price);
                return (
                  <tr key={p.id} className="border-t border-navy-50">
                    <td className="p-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-navy-50">
                        {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-navy-900">{p.name}<p className="text-xs font-normal text-navy-900/40">SKU: {p.sku}</p></td>
                    <td className="p-3">{cat && <span className="rounded bg-info/10 px-2 py-1 text-xs text-info">{cat.name}</span>}</td>
                    <td className="p-3 text-navy-900/40 line-through">{formatSom(p.old_price ?? 0)}</td>
                    <td className="p-3 font-semibold">{formatSom(p.price)}</td>
                    <td className="p-3"><span className="rounded bg-danger/10 px-2 py-1 text-xs text-danger">-{discount}%</span></td>
                    <td className="p-3"><span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">Faol</span></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50"><Pencil size={14} /></button>
                        <a href={`/products/${p.slug}`} target="_blank" className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50"><Eye size={14} /></a>
                        <button onClick={() => removeSale(p)} className="rounded-lg border border-navy-100 p-1.5 text-danger hover:bg-danger/5"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {saleProducts.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-navy-900/40">Aksiya mahsulotlar mavjud emas.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-danger/5 p-5">
          <div className="flex items-center gap-3">
            <Gift className="text-danger" size={20} />
            <div>
              <p className="font-semibold text-navy-900">Chegirmalar bilan savdoni oshiring!</p>
              <p className="text-sm text-navy-900/50">Aksiya mahsulotlari mijozlar e'tiborini jalb qiladi va sotuvlarni ko'paytiradi.</p>
            </div>
          </div>
          <a href="/admin/products" className="whitespace-nowrap rounded-lg bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            + Yangi aksiya qo'shish
          </a>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Aksiya narxini tahrirlash">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Oddiy narx</label>
            <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Aksiya narxi</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800">Saqlash</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


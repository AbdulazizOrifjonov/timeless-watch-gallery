"use client";

import Image from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import { useMemo, useState, useEffect } from "react";
import { Eye, Package, Pencil, Plus, Trash2, CircleDot, AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useStore } from "@/lib/store";
import { Product } from "@/types/database";
import { formatSom } from "@/lib/utils";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  old_price: "",
  category_id: "",
  brand: "",
  sku: "",
  mechanism: "Avtomatik",
  stock: "99",
  image: null as string | null,
  images: [] as string[],
  is_active: true,
};

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct: storeDeleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, pageSize]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.sku ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      if (statusFilter === "out" && p.stock > 0) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const activeCount = products.filter((p) => p.is_active && p.stock > 0).length;
  const outCount = products.filter((p) => p.stock <= 0).length;
  const inactiveCount = products.filter((p) => !p.is_active).length;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function confirmDelete(p: Product) {
    setDeletingProduct(p);
  }

  function handleDelete() {
    if (deletingProduct) {
      storeDeleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  }

  function toggleActive(p: Product) {
    updateProduct(p.id, { is_active: !p.is_active });
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : "",
      category_id: p.category_id ?? "",
      brand: p.brand ?? "",
      sku: p.sku ?? "",
      mechanism: p.mechanism || "Avtomatik",
      stock: String(p.stock),
      image: p.image,
      images: p.images ? p.images.map(img => img.url) : [],
      is_active: p.is_active,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<Product> = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id || null,
      brand: form.brand,
      sku: form.sku,
      mechanism: form.mechanism || "Avtomatik",
      stock: Number(form.stock) || 99,
      image: form.image,
      images: form.images.map((url, i) => ({ id: `img-${Date.now()}-${i}`, product_id: editing?.id || "", url, sort_order: i + 1 })),
      is_active: form.is_active,
    };
    if (editing) {
      updateProduct(editing.id, payload);
    } else {
      addProduct(payload);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Mahsulot, kategoriya yoki SKU bo'yicha qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Mahsulotlar</h1>
            <p className="text-sm text-navy-900/50">Barcha mahsulotlarni boshqarish, qo'shish, tahrirlash va o'chirish</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi mahsulot qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Package} label="Jami mahsulotlar" value={products.length} change="+12" color="bg-info" />
          <StatCard icon={CircleDot} label="Faol mahsulotlar" value={activeCount} change="+8" color="bg-success" />
          <StatCard icon={AlertTriangle} label="Tugagan mahsulotlar" value={outCount} change="-3" color="bg-orange-500" />
          <StatCard icon={Ban} label="Nofaol mahsulotlar" value={inactiveCount} change="-1" color="bg-danger" />
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            className="flex-1 rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
          />
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
            <option value="out">Tugagan</option>
          </select>
        </div>

        {/* MOBIL KO'RINISH: Telefonlarda har bir mahsulot uchun alohida karta (Tahrirlash va O'chirish doim ko'rinib turadi) */}
        <div className="md:hidden space-y-3">
          {pageItems.map((p) => {
            const cat = categories.find((c) => c.id === p.category_id);
            return (
              <div key={p.id} className="rounded-xl border border-navy-100 bg-white p-3.5 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-50 border border-navy-100">
                    {p.image ? (
                      <SafeImage src={p.image} fallbackSrc="/placeholder.png" alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-navy-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {cat && (
                        <span className="rounded bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">
                          {cat.name}
                        </span>
                      )}
                      {p.brand && (
                        <span className="text-xs text-navy-900/50 font-medium">{p.brand}</span>
                      )}
                    </div>
                    <p className="font-semibold text-navy-950 text-sm leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-bold text-navy-900 text-sm">{formatSom(p.price)}</span>
                      <span className="text-[10px] text-navy-900/40 font-mono">SKU: {p.sku}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-navy-50 pt-2.5">
                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                      p.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <span>{p.is_active ? "Faol" : "Nofaol"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      title="Tahrirlash"
                      className="flex items-center gap-1 rounded-lg border border-navy-200/80 bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 active:scale-95 transition"
                    >
                      <Pencil size={13} className="text-navy-700" />
                      <span>Tahrirlash</span>
                    </button>
                    <a
                      href={`/products/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Saytda ochish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200/80 text-navy-700 hover:bg-navy-50 hover:text-gold-600 transition"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => confirmDelete(p)}
                      title="O'chirish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-red-100 active:scale-95 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {pageItems.length === 0 && (
            <div className="rounded-xl border border-navy-100 bg-white p-8 text-center text-sm text-navy-900/40">
              Mahsulot topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP KO'RINISH: Katta ekranlar uchun to'liq jadval */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Mahsulot nomi</th>
                <th className="p-3">Kategoriya</th>
                <th className="p-3">Brend</th>
                <th className="p-3">Narxi</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {pageItems.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="hover:bg-navy-50/40 transition-colors">
                    <td className="p-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-navy-50">
                        {p.image && <SafeImage src={p.image} fallbackSrc="/placeholder.png" alt={p.name} fill className="object-cover" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-navy-900">{p.name}</p>
                      <p className="text-xs text-navy-900/40">SKU: {p.sku}</p>
                    </td>
                    <td className="p-3">
                      {cat && <span className="rounded bg-info/10 px-2 py-1 text-xs text-info">{cat.name}</span>}
                    </td>
                    <td className="p-3">{p.brand}</td>
                    <td className="p-3">{formatSom(p.price)}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        title={p.is_active ? "Nofaol qilish uchun bosing" : "Faollashtirish uchun bosing"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition shadow-2xs ${
                          p.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span>{p.is_active ? "Faol" : "Nofaol"}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          title="Tahrirlash"
                          className="rounded-lg border border-navy-100 p-1.5 text-navy-700 hover:bg-navy-50 hover:text-navy-950 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <a
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Saytda ochish"
                          className="rounded-lg border border-navy-100 p-1.5 text-navy-700 hover:bg-navy-50 hover:text-gold-600 transition"
                        >
                          <Eye size={14} />
                        </a>
                        <button
                          onClick={() => confirmDelete(p)}
                          title="O'chirish"
                          className="rounded-lg border border-red-100 p-1.5 text-danger hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-navy-900/40">Mahsulot topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
          pageSizeOptions={[12, 24, 48, 96]}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Mahsulot rasmlari *</label>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              <ImageUploader 
                value={form.image} 
                onChange={(v) => setForm((f) => ({ ...f, image: v }))} 
                label="Asosiy" 
              />
              {form.images.map((img, idx) => (
                <ImageUploader 
                  key={idx}
                  value={img} 
                  onChange={(v) => {
                    setForm((f) => {
                      const newImages = [...f.images];
                      if (v) newImages[idx] = v;
                      else newImages.splice(idx, 1);
                      return { ...f, images: newImages };
                    });
                  }} 
                  label={`Qo'shimcha ${idx + 1}`} 
                />
              ))}
              {(form.image || form.images.length > 0) && (
                <ImageUploader 
                  value={null} 
                  onChange={(v) => {
                    if (v) setForm((f) => ({ ...f, images: [...f.images, v] }));
                  }} 
                  label="Yana qo'shish" 
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Mahsulot nomi *</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Tavsif</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Narxi *</label>
              <input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Eski narx</label>
              <input type="number" value={form.old_price} onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategoriya</label>
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
                <option value="">Tanlanmagan</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Brend</label>
              <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SKU</label>
              <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mexanizm</label>
              <select
                value={form.mechanism}
                onChange={(e) => setForm((f) => ({ ...f, mechanism: e.target.value }))}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm bg-white"
              >
                <option value="Avtomatik">Avtomatik</option>
                <option value="Kvars (Batareyka)">Kvars (Batareyka)</option>
                <option value="Mexanik">Mexanik</option>
                <option value="Smart / Elektron">Smart / Elektron</option>
                <option value="Xronograf">Xronograf</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 rounded border-navy-200 text-navy-900" />
              <label htmlFor="active" className="text-sm font-medium">Faol (saytda ko'rinadi)</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
              {editing ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deletingProduct} onClose={() => setDeletingProduct(null)} title="Mahsulotni o'chirish" width="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-navy-900/80">
            Haqiqatan ham <strong className="text-navy-900">&ldquo;{deletingProduct?.name}&rdquo;</strong> mahsulotini o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingProduct(null)}
              className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 transition shadow-xs"
            >
              O'chirish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


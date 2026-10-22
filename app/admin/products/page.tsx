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

const TOP_WATCH_BRANDS = [
  "Rolex",
  "Omega",
  "Patek Philippe",
  "Audemars Piguet",
  "Cartier",
  "Tissot",
  "Orient",
  "Casio",
  "IWC Schaffhausen",
  "Hublot",
  "Breitling",
  "TAG Heuer",
  "Vacheron Constantin",
  "Tsar Bomba",
  "Longines",
  "Seiko",
  "Rado",
  "Citizen",
  "Richard Mille",
  "Jaeger-LeCoultre",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  old_price: "",
  category_id: "",
  brand: "Rolex",
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

  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [isCustomBrandInput, setIsCustomBrandInput] = useState(false);
  const [newBrandText, setNewBrandText] = useState("");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = JSON.parse(localStorage.getItem("tml_custom_brands") || "[]");
        setCustomBrands(stored);
      }
    } catch {}
  }, []);

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
    setIsCustomBrandInput(false);
    setNewBrandText("");
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
      brand: p.brand || "Rolex",
      sku: p.sku ?? "",
      mechanism: p.mechanism || "Avtomatik",
      stock: String(p.stock),
      image: p.image,
      images: p.images ? p.images.map(img => img.url) : [],
      is_active: p.is_active,
    });
    setIsCustomBrandInput(false);
    setNewBrandText("");
    setModalOpen(true);
  }

  // Narx kiritilganda avtomatik eski narxni 15% qimmatroq qilib belgilash
  function handlePriceChange(val: string) {
    const num = Number(val);
    let autoOld = "";
    if (num > 0) {
      // 15% qimmatroq va 10 000 ga yaxlitlash
      autoOld = String(Math.round((num * 1.15) / 10000) * 10000);
    }
    setForm((f) => ({
      ...f,
      price: val,
      old_price: autoOld,
    }));
  }

  function handleSaveCustomBrand() {
    const trimmed = newBrandText.trim();
    if (!trimmed) return;
    const updated = Array.from(new Set([trimmed, ...customBrands]));
    setCustomBrands(updated);
    try {
      localStorage.setItem("tml_custom_brands", JSON.stringify(updated));
    } catch {}
    setForm((f) => ({ ...f, brand: trimmed }));
    setIsCustomBrandInput(false);
    setNewBrandText("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalImage = form.image || (form.images.length > 0 ? form.images[0] : "/placeholder.png");
    const finalImages = form.images.length > 0 
      ? (form.image && !form.images.includes(form.image) ? [form.image, ...form.images] : form.images)
      : [finalImage];

    const autoSku = form.sku || `WT-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload: Partial<Product> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id || null,
      brand: form.brand.trim() || "Boshqa",
      sku: autoSku,
      mechanism: form.mechanism || "Avtomatik",
      stock: Number(form.stock) || 99,
      image: finalImage,
      images: finalImages.map((url, i) => ({
        id: `img-${Date.now()}-${i}`,
        product_id: editing?.id || "",
        url,
        sort_order: i + 1,
      })),
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
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Mahsulot yoki brend bo'yicha qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Mahsulotlar</h1>
            <p className="text-sm text-navy-900/50">Barcha mahsulotlarni boshqarish, qo'shish, tahrirlash va o'chirish</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 shadow-xs active:scale-95 transition">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi, brendi bo'yicha qidirish..."
            className="w-full max-w-xs rounded-xl border border-navy-100 px-3 py-2 text-sm outline-none focus:border-navy-900 bg-white"
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-navy-900">
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-navy-900">
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
            <option value="out">Tugagan</option>
          </select>
        </div>

        {/* MOBIL KO'RINISH: Telefonlar uchun mahsulot kartalari */}
        <div className="md:hidden space-y-3">
          {pageItems.map((p) => {
            const cat = categories.find((c) => c.id === p.category_id);
            return (
              <div key={p.id} className="rounded-xl border border-navy-100 bg-white p-3.5 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-50 border border-navy-100">
                    <SafeImage src={p.image} fallbackSrc="/placeholder.png" alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-navy-500">{p.brand || "Brendsiz"} · {cat?.name ?? "—"}</p>
                    <p className="font-bold text-navy-950 text-sm mt-1">{formatSom(p.price)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-navy-50 text-xs">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${p.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-danger border border-red-200"}`}
                  >
                    {p.is_active ? "✓ Faol" : "Nofaol"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex h-8 items-center gap-1 rounded-lg border border-navy-200/80 bg-navy-50 px-2.5 text-xs font-semibold text-navy-800 hover:bg-navy-100 active:scale-95 transition"
                    >
                      <Pencil size={12} />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-red-100 active:scale-95 transition"
                      aria-label="O'chirish"
                    >
                      <Trash2 size={13} />
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

        {/* DESKTOP JADVAL: Katta ekranlar uchun */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Nomi</th>
                <th className="p-3">Brend</th>
                <th className="p-3">Kategoriya</th>
                <th className="p-3">Narxi</th>
                <th className="p-3">Eski narx</th>
                <th className="p-3">Mexanizm</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {pageItems.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="hover:bg-navy-50/50">
                    <td className="p-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-navy-50 border border-navy-100">
                        <SafeImage src={p.image} fallbackSrc="/placeholder.png" alt={p.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-medium text-navy-900 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                    <td className="p-3 text-navy-700 font-medium">{p.brand || "—"}</td>
                    <td className="p-3 text-navy-900/60">{cat?.name ?? "—"}</td>
                    <td className="p-3 font-semibold">{formatSom(p.price)}</td>
                    <td className="p-3 text-navy-400 line-through text-xs">{p.old_price ? formatSom(p.old_price) : "—"}</td>
                    <td className="p-3 text-xs text-navy-600">{p.mechanism || "Avtomatik"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer transition ${p.is_active ? "bg-success/10 text-success hover:bg-success/20" : "bg-danger/10 text-danger hover:bg-danger/20"}`}
                      >
                        {p.is_active ? "Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded p-1 hover:bg-navy-50 text-navy-900/60 hover:text-navy-900" title="Tahrirlash">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => confirmDelete(p)} className="rounded p-1 hover:bg-danger/10 text-danger" title="O'chirish">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-navy-900/40">Mahsulot topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
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
                label="Asosiy rasm *" 
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
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Masalan: Rolex Submariner Date 41mm" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Tavsif</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Soat haqida batafsil ma'lumot..." className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900" />
            </div>

            {/* Narx va Eski narx (Avtomatik 15% qimmatroq hisoblanadi) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Narxi (so'm) *</label>
              <input required type="number" value={form.price} onChange={(e) => handlePriceChange(e.target.value)} placeholder="Masalan: 4500000" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900 font-semibold" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Eski narx (aksiya uchun)</label>
              <input type="number" value={form.old_price} onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))} placeholder="Avtomatik to'ldiriladi" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900" />
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                ✓ Narxdan ~15% qimmatroq avtomatik kiritildi (o'zgartirishingiz mumkin)
              </p>
            </div>

            {/* Kategoriya */}
            <div>
              <label className="mb-1 block text-sm font-medium">Kategoriya</label>
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm bg-white outline-none focus:border-navy-900">
                <option value="">Tanlanmagan</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* TOP Brendlar + Yangi brend kiritish logikasi */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium">Brend *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomBrandInput(!isCustomBrandInput)}
                  className="text-xs text-[#5E3023] font-semibold hover:underline"
                >
                  {isCustomBrandInput ? "Ro'yxatdan tanlash" : "+ Yangi brend yozish"}
                </button>
              </div>

              {isCustomBrandInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Yangi brend nomi (masalan: Hublot)..."
                    value={newBrandText}
                    onChange={(e) => setNewBrandText(e.target.value)}
                    className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveCustomBrand();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomBrand}
                    className="shrink-0 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                  >
                    Qo'shish
                  </button>
                </div>
              ) : (
                <select
                  value={form.brand}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setIsCustomBrandInput(true);
                    } else {
                      setForm((f) => ({ ...f, brand: e.target.value }));
                    }
                  }}
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy-900 font-medium"
                >
                  <option value="">Tanlanmagan</option>
                  <optgroup label="⭐ TOP Mashhur Brendlar">
                    {TOP_WATCH_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </optgroup>
                  {customBrands.length > 0 && (
                    <optgroup label="Siz qo'shgan brendlar">
                      {customBrands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__add_new__">+ Yangi brend qo'shish...</option>
                </select>
              )}
            </div>

            {/* Mexanizm */}
            <div>
              <label className="mb-1 block text-sm font-medium">Mexanizm</label>
              <select
                value={form.mechanism}
                onChange={(e) => setForm((f) => ({ ...f, mechanism: e.target.value }))}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm bg-white outline-none focus:border-navy-900"
              >
                <option value="Avtomatik">Avtomatik mexanik</option>
                <option value="Kvars (Batareyka)">Kvars (Batareyka)</option>
                <option value="Mexanik (Qo'lda buraladigan)">Mexanik (Qo'lda buraladigan)</option>
                <option value="Smart / Elektron">Smart / Elektron</option>
                <option value="Xronograf">Xronograf</option>
              </select>
            </div>

            {/* Faol statusi */}
            <div className="flex items-center gap-2 pt-6">
              <input id="active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 rounded border-navy-200 text-navy-900 cursor-pointer" />
              <label htmlFor="active" className="text-sm font-medium cursor-pointer">Faol (saytda ko'rinadi)</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium hover:bg-navy-50">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 shadow-xs active:scale-95 transition">
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

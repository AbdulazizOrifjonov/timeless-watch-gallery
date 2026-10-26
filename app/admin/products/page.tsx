"use client";

import Image from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import { useMemo, useState, useEffect } from "react";
import { Eye, Package, Pencil, Plus, Trash2, CircleDot, AlertTriangle, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useStore } from "@/lib/store";
import { useToast } from "@/context/ToastContext";
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
  stock: "10",
  image: null as string | null,
  images: [] as string[],
  is_active: true,
};

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct: storeDeleteProduct } = useStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsSubmitting(false);
    setModalOpen(true);
  }

  function confirmDelete(p: Product) {
    setDeletingProduct(p);
  }

  async function handleDelete() {
    if (!deletingProduct || isDeleting) return;
    setIsDeleting(true);
    try {
      storeDeleteProduct(deletingProduct.id);
      showToast("Mahsulot muvaffaqiyatli o'chirildi", "info");
      setDeletingProduct(null);
    } catch (err: any) {
      showToast(err?.message || "O'chirishda xatolik yuz berdi", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  function toggleActive(p: Product) {
    const newState = !p.is_active;
    updateProduct(p.id, { is_active: newState });
    showToast(`Mahsulot ${newState ? "faollashtirildi" : "nofaol qilindi"}`, "info");
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
      stock: String(p.stock ?? 10),
      image: p.image,
      images: p.images ? p.images.map((img) => img.url) : [],
      is_active: p.is_active,
    });
    setIsCustomBrandInput(false);
    setNewBrandText("");
    setIsSubmitting(false);
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
    showToast(`"${trimmed}" brendi qo'shildi va tanlandi!`, "success");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const validExtra = (form.images || []).filter(
        (img) => typeof img === 'string' && img.trim().length > 0 && img !== '/placeholder.png'
      );
      const mainImg = form.image?.trim() || (validExtra.length > 0 ? validExtra[0] : '/placeholder.png');
      
      const combined = Array.from(new Set([mainImg, ...validExtra])).filter(
        (img) => img && img !== '/placeholder.png'
      );
      const finalImageList = combined.length > 0 ? combined : [mainImg];

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
        stock: Number(form.stock) || 0,
        image: finalImageList[0] || "/placeholder.png",
        images: finalImageList.map((url, i) => ({
          id: `img-${Date.now()}-${i}`,
          product_id: editing?.id || "",
          url,
          sort_order: i + 1,
        })),
        is_active: form.is_active,
      };

      if (editing) {
        updateProduct(editing.id, payload);
        showToast("Mahsulot muvaffaqiyatli saqlandi!", "success");
      } else {
        addProduct(payload);
        showToast("Yangi mahsulot muvaffaqiyatli qo'shildi!", "success");
      }

      setModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || "Xatolik yuz berdi", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Mahsulot yoki brend bo'yicha qidirish..." />
      <div className="p-3.5 sm:p-6 space-y-5">
        
        {/* Yuqori qism: Sarlavha va qo'shish tugmasi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 leading-tight">Mahsulotlar</h1>
            <p className="text-xs sm:text-sm text-navy-900/50 mt-0.5">Barcha mahsulotlarni boshqarish, qo'shish va tahrirlash</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-navy-800 shadow-sm active:scale-95 transition touch-target w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>Yangi mahsulot qo'shish</span>
          </button>
        </div>

        {/* Statistika kartalari */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          <StatCard icon={Package} label="Jami mahsulotlar" value={products.length} change="+12" color="bg-info" />
          <StatCard icon={CircleDot} label="Faol mahsulotlar" value={activeCount} change="+8" color="bg-success" />
          <StatCard icon={AlertTriangle} label="Tugagan mahsulotlar" value={outCount} change="-3" color="bg-orange-500" />
          <StatCard icon={Ban} label="Nofaol mahsulotlar" value={inactiveCount} change="-1" color="bg-danger" />
        </div>

        {/* Qidiruv va Filtrlar */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki brendi bo'yicha qidirish..."
            className="w-full sm:max-w-xs rounded-xl border border-navy-100 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900 bg-white shadow-2xs"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-navy-900 shadow-2xs"
            >
              <option value="all">Barcha kategoriyalar</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-navy-900 shadow-2xs"
            >
              <option value="all">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
              <option value="out">Tugagan</option>
            </select>
          </div>
        </div>

        {/* MOBIL KO'RINISH: Telefonlar uchun mahsulot kartalari */}
        <div className="md:hidden space-y-3">
          {pageItems.map((p) => {
            const cat = categories.find((c) => c.id === p.category_id);
            return (
              <div key={p.id} className="rounded-2xl border border-navy-100 bg-white p-3.5 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-50 border border-navy-100">
                    <SafeImage src={p.image} fallbackSrc="/placeholder.png" alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-navy-500 mt-0.5">
                      <span className="font-semibold text-navy-800">{p.brand || "Brendsiz"}</span> · {cat?.name ?? "—"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-navy-950 text-sm">{formatSom(p.price)}</span>
                      {p.old_price && p.old_price > p.price && (
                        <span className="text-xs text-navy-400 line-through">{formatSom(p.old_price)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-50 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        p.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-danger border border-red-200"
                      }`}
                    >
                      {p.is_active ? "✓ Faol" : "Nofaol"}
                    </button>
                    <span className="text-[11px] text-navy-500">
                      Soni: <strong className="text-navy-900">{p.stock} ta</strong>
                    </span>
                  </div>

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
            <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-navy-900/40">
              Mahsulot topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL: Katta ekranlar uchun */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] border-b border-navy-100 text-xs text-navy-900/60 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 font-bold">Rasm</th>
                <th className="p-3.5 font-bold">Nomi</th>
                <th className="p-3.5 font-bold">Brend</th>
                <th className="p-3.5 font-bold">Kategoriya</th>
                <th className="p-3.5 font-bold">Narxi</th>
                <th className="p-3.5 font-bold">Eski narx</th>
                <th className="p-3.5 font-bold">Omborda</th>
                <th className="p-3.5 font-bold">Mexanizm</th>
                <th className="p-3.5 font-bold">Holat</th>
                <th className="p-3.5 text-right font-bold">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {pageItems.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="hover:bg-navy-50/50 transition-colors">
                    <td className="p-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-navy-50 border border-navy-100">
                        <SafeImage src={p.image} fallbackSrc="/placeholder.png" alt={p.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-navy-950 max-w-[200px] truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="p-3 text-navy-800 font-medium">{p.brand || "—"}</td>
                    <td className="p-3 text-navy-900/60">{cat?.name ?? "—"}</td>
                    <td className="p-3 font-bold text-navy-950">{formatSom(p.price)}</td>
                    <td className="p-3 text-navy-400 line-through text-xs">
                      {p.old_price ? formatSom(p.old_price) : "—"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger"}`}>
                        {p.stock > 0 ? `${p.stock} ta` : "Tugagan"}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-navy-600">{p.mechanism || "Avtomatik"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition ${
                          p.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-red-50 text-danger hover:bg-red-100 border border-red-200"
                        }`}
                      >
                        {p.is_active ? "Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-1.5 hover:bg-navy-50 text-navy-700 hover:text-navy-950 transition"
                          title="Tahrirlash"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(p)}
                          className="rounded-lg p-1.5 hover:bg-red-50 text-danger transition"
                          title="O'chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-navy-900/40">
                    Mahsulot topilmadi.
                  </td>
                </tr>
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

      {/* Mahsulot qo'shish / tahrirlash modali */}
      <Modal open={modalOpen} onClose={() => !isSubmitting && setModalOpen(false)} title={editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="mb-2 block text-xs sm:text-sm font-semibold text-navy-900">Mahsulot rasmlari *</label>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 custom-scrollbar">
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

          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Mahsulot nomi *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Masalan: Rolex Submariner Date 41mm"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Tavsif</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Soat haqida batafsil ma'lumot..."
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900"
              />
            </div>

            {/* Narx va Eski narx (Avtomatik 15% qimmatroq hisoblanadi) */}
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Narxi (so'm) *</label>
              <input
                required
                type="number"
                value={form.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="Masalan: 4500000"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900 font-semibold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Eski narx (aksiya uchun)</label>
              <input
                type="number"
                value={form.old_price}
                onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))}
                placeholder="Avtomatik to'ldiriladi"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900"
              />
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                ✓ Narxdan ~15% qimmatroq avtomatik kiritildi (o'zgartirish mumkin)
              </p>
            </div>

            {/* Ombordagi soni (STOCK) */}
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Ombordagi soni (dona) *</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="Masalan: 10"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900 font-semibold"
              />
            </div>

            {/* Kategoriya */}
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Kategoriya</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm bg-white outline-none focus:border-navy-900"
              >
                <option value="">Tanlanmagan</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TOP Brendlar + Yangi brend kiritish logikasi */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-navy-800">Brend *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomBrandInput(!isCustomBrandInput)}
                  className="text-xs text-[#5E3023] font-semibold hover:underline"
                >
                  {isCustomBrandInput ? "Ro'yxatdan tanlash" : "+ Yangi brend yozish"}
                </button>
              </div>

              {isCustomBrandInput ? (
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    placeholder="Yangi brend nomi (masalan: Hublot)..."
                    value={newBrandText}
                    onChange={(e) => setNewBrandText(e.target.value)}
                    className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900"
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
                    className="shrink-0 rounded-xl bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-800 active:scale-95 transition"
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
                  className="w-full rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-navy-900 font-medium"
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
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-navy-800">Mexanizm</label>
              <select
                value={form.mechanism}
                onChange={(e) => setForm((f) => ({ ...f, mechanism: e.target.value }))}
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-xs sm:text-sm bg-white outline-none focus:border-navy-900"
              >
                <option value="Avtomatik">Avtomatik mexanik</option>
                <option value="Kvars (Batareyka)">Kvars (Batareyka)</option>
                <option value="Mexanik (Qo'lda buraladigan)">Mexanik (Qo'lda buraladigan)</option>
                <option value="Smart / Elektron">Smart / Elektron</option>
                <option value="Xronograf">Xronograf</option>
              </select>
            </div>

            {/* Faol statusi */}
            <div className="flex items-center gap-2 pt-2 sm:pt-4 sm:col-span-2">
              <input
                id="active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-navy-300 text-navy-900 cursor-pointer"
              />
              <label htmlFor="active" className="text-xs sm:text-sm font-semibold text-navy-900 cursor-pointer">
                Faol (saytda mijozlarga ko'rinadi)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-navy-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-navy-700 hover:bg-navy-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-navy-800 shadow-sm active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin text-[#D8B775]" />}
              <span>
                {isSubmitting
                  ? editing
                    ? "Saqlanmoqda..."
                    : "Qo'shilmoqda..."
                  : editing
                  ? "Saqlash"
                  : "Qo'shish"}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deletingProduct} onClose={() => !isDeleting && setDeletingProduct(null)} title="Mahsulotni o'chirish" width="max-w-md">
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-navy-900/80">
            Haqiqatan ham <strong className="text-navy-900">&ldquo;{deletingProduct?.name}&rdquo;</strong> mahsulotini o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-navy-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingProduct(null)}
              className="rounded-xl border border-navy-200 px-4 py-2 text-xs sm:text-sm font-semibold text-navy-900 hover:bg-navy-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl bg-danger px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-danger/90 transition shadow-xs disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              <span>{isDeleting ? "O'chirilmoqda..." : "O'chirish"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

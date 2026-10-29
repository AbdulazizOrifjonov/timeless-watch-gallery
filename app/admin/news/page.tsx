"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Megaphone,
  Tag,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  Package,
  Search,
  Check,
  Percent,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useStore } from "@/lib/store";
import { useToast } from "@/context/ToastContext";
import { NewsItem, NewsType, Product } from "@/types/database";
import { formatSom } from "@/lib/utils";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  content: "",
  image_url: null as string | null,
  type: "yangilik" as NewsType,
  badge: "",
  link: "",
  button_text: "Batafsil",
  product_ids: [] as string[],
  discount_percent: "",
  applyDiscountToProducts: true,
  is_active: true,
};

const TYPE_CONFIG: Record<
  NewsType,
  { label: string; badgeClass: string; icon: string }
> = {
  yangilik: {
    label: "Yangilik",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "📰",
  },
  aksiya: {
    label: "Aksiya",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "🔥",
  },
  reklama: {
    label: "Reklama",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "📢",
  },
  tavsiya: {
    label: "Tavsiya",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "💡",
  },
};

export default function AdminNewsPage() {
  const { news, products, updateProduct, addNews, updateNews, deleteNews, toggleNews } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal product search & tab
  const [prodSearch, setProdSearch] = useState("");
  const [prodTab, setProdTab] = useState<"all" | "unsold" | "selected">("all");

  const filtered = useMemo(() => {
    return news.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (item.badge && item.badge.toLowerCase().includes(search.toLowerCase()));
      const matchType = typeFilter === "all" || item.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [news, search, typeFilter]);

  // Modal product list filtering
  const filteredModalProducts = useMemo(() => {
    return products.filter((p) => {
      const q = prodSearch.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (prodTab === "selected") {
        return form.product_ids.includes(p.id);
      }
      if (prodTab === "unsold") {
        // Unsold / high stock products
        return p.stock >= 3;
      }
      return true;
    });
  }, [products, prodSearch, prodTab, form.product_ids]);

  const activeCount = news.filter((n) => n.is_active).length;
  const promoCount = news.filter((n) => n.type === "aksiya" || n.type === "reklama").length;
  const totalViews = news.reduce((acc, n) => acc + (n.views_count || 0), 0);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setProdSearch("");
    setProdTab("all");
    setModalOpen(true);
  }

  function openEdit(item: NewsItem) {
    setEditing(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle || "",
      content: item.content || "",
      image_url: item.image_url,
      type: item.type,
      badge: item.badge || "",
      link: item.link || "",
      button_text: item.button_text || "Batafsil",
      product_ids: item.product_ids || [],
      discount_percent: item.discount_percent ? String(item.discount_percent) : "",
      applyDiscountToProducts: true,
      is_active: item.is_active,
    });
    setProdSearch("");
    setProdTab("all");
    setModalOpen(true);
  }

  function toggleProductSelection(productId: string) {
    setForm((f) => {
      const exists = f.product_ids.includes(productId);
      const nextIds = exists
        ? f.product_ids.filter((id) => id !== productId)
        : [...f.product_ids, productId];
      return { ...f, product_ids: nextIds };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.title.trim()) {
      showToast("Iltimos, sarlavhani kiriting!", "error");
      return;
    }
    if (!form.image_url) {
      showToast("Iltimos, reklama / yangilik rasmini yuklang!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const discountNum = Number(form.discount_percent) || null;

      const payload: Partial<NewsItem> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        content: form.content.trim(),
        image_url: form.image_url,
        type: form.type,
        badge: form.badge.trim() || (discountNum ? `Aksiya -${discountNum}%` : null),
        link: form.link.trim() || null,
        button_text: form.button_text.trim() || "Batafsil",
        product_ids: form.product_ids,
        discount_percent: discountNum,
        is_active: form.is_active,
      };

      if (editing) {
        updateNews(editing.id, payload);
        showToast("Yangilik / reklama muvaffaqiyatli saqlandi!", "success");
      } else {
        addNews(payload);
        showToast("Yangi e'lon muvaffaqiyatli qo'shildi!", "success");
      }

      // If user checked applyDiscountToProducts and set discountNum > 0
      if (form.applyDiscountToProducts && discountNum && discountNum > 0 && form.product_ids.length > 0) {
        for (const pId of form.product_ids) {
          const prod = products.find((p) => p.id === pId);
          if (prod) {
            const basePrice = prod.old_price && prod.old_price > prod.price ? prod.old_price : prod.price;
            const newPrice = Math.round((basePrice * (100 - discountNum)) / 100);
            updateProduct(prod.id, {
              price: newPrice,
              old_price: basePrice,
              discount: discountNum,
            });
          }
        }
        showToast(`${form.product_ids.length} ta mahsulotga -${discountNum}% chegirma qo'llandi!`, "success");
      }

      setModalOpen(false);
    } catch (err: any) {
      showToast("Xatolik yuz berdi: " + (err?.message || "Saqlab bo'lmadi"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingItem || isDeleting) return;
    setIsDeleting(true);
    try {
      deleteNews(deletingItem.id);
      showToast("E'lon muvaffaqiyatli o'chirildi", "info");
      setDeletingItem(null);
    } catch (err) {
      showToast("O'chirishda xatolik yuz berdi", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <AdminHeader
        title="Timeless — The Watch Gallery Admin"
        searchPlaceholder="Yangilik yoki reklama sarlavhasi bo'yicha qidirish..."
      />

      <div className="p-3.5 sm:p-6 space-y-6">
        {/* Top Title & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Newspaper className="text-[#C5A059]" size={26} />
              Yangiliklar, Aksiyalar & Reklama
            </h1>
            <p className="text-sm text-navy-900/50 mt-0.5">
              Do'kon yangiliklari, sotilmagan mahsulotlarga chegirma berish, aksiya va reklama bannerlarini boshqarish
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 px-4 py-2.5 text-sm font-bold text-white transition shadow-md shadow-[#5E3023]/20 touch-target"
          >
            <Plus size={18} /> Yangi aksiya / reklama qo'shish
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <StatCard icon={Newspaper} label="Jami e'lonlar" value={news.length} color="bg-info" />
          <StatCard icon={CheckCircle2} label="Faol ko'rinayotganlar" value={activeCount} color="bg-success" />
          <StatCard icon={Megaphone} label="Aksiya & Reklamalar" value={promoCount} color="bg-purple-600" />
          <StatCard icon={Eye} label="Jami ko'rishlar" value={totalViews.toLocaleString("uz-UZ")} color="bg-amber-500" />
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setTypeFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === "all"
                  ? "bg-navy-900 text-white"
                  : "bg-white border border-navy-100 text-navy-900/70 hover:bg-navy-50"
              }`}
            >
              Barchasi ({news.length})
            </button>
            {(["yangilik", "aksiya", "reklama", "tavsiya"] as NewsType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                  typeFilter === t
                    ? "bg-navy-900 text-white"
                    : "bg-white border border-navy-100 text-navy-900/70 hover:bg-navy-50"
                }`}
              >
                <span>{TYPE_CONFIG[t].icon}</span>
                <span>{TYPE_CONFIG[t].label}</span>
                <span className="opacity-60 text-[10px]">
                  ({news.filter((n) => n.type === t).length})
                </span>
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sarlavha bo'yicha qidirish..."
            className="w-full sm:w-72 rounded-xl border border-navy-100 bg-white px-3.5 py-2 text-xs font-medium text-navy-900 outline-none focus:border-navy-900"
          />
        </div>

        {/* MOBIL KO'RINISH: Kartalar */}
        <div className="md:hidden space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xs space-y-3"
            >
              {/* Banner Rasm va Badge */}
              <div className="relative h-44 w-full bg-navy-950">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover opacity-85"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-navy-400">
                    <Newspaper size={36} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />

                {/* Yuqori teglari */}
                <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-bold border backdrop-blur-xs ${
                      TYPE_CONFIG[item.type].badgeClass
                    }`}
                  >
                    {TYPE_CONFIG[item.type].icon} {TYPE_CONFIG[item.type].label}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleNews(item.id)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs transition ${
                      item.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-300 border border-white/20"
                    }`}
                  >
                    {item.is_active ? "Faol" : "Nofaol"}
                  </button>
                </div>

                {/* Sarlavha va Badge */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {item.badge && (
                      <span className="rounded bg-[#C5A059] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-navy-950 shadow-xs">
                        {item.badge}
                      </span>
                    )}
                    {item.discount_percent && (
                      <span className="rounded bg-danger px-2 py-0.5 text-[10px] font-extrabold text-white">
                        -{item.discount_percent}% Chegirma
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold leading-snug drop-shadow-xs line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Matn va Aksiyadagi mahsulotlar belgisi */}
              <div className="px-3.5 pb-1 space-y-2">
                {item.subtitle && (
                  <p className="text-xs text-navy-900/70 line-clamp-2 font-medium">
                    {item.subtitle}
                  </p>
                )}

                {item.product_ids && item.product_ids.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-900">
                    <Package size={13} className="text-amber-700" />
                    <span>{item.product_ids.length} ta mahsulot aksiyaga biriktirilgan</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-navy-900/50 pt-1">
                  <span>👁 {item.views_count?.toLocaleString("uz-UZ") || 0} marta ko'rildi</span>
                  <span>{new Date(item.published_at || item.created_at).toLocaleDateString("uz-UZ")}</span>
                </div>
              </div>

              {/* Boshqaruv tugmalari */}
              <div className="flex items-center justify-between p-3 border-t border-navy-50 bg-navy-50/30">
                <a
                  href={`/news/${item.slug || item.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-[#5E3023] hover:underline"
                >
                  <ExternalLink size={13} />
                  <span>Sahifada ko'rish</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1 rounded-lg border border-navy-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-50 transition"
                  >
                    <Pencil size={13} className="text-navy-700" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-red-100 transition"
                    title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center text-sm text-navy-900/40">
              Hech qanday yangilik yoki aksiya topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/60 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Banner</th>
                <th className="p-3.5">Sarlavha & Anons</th>
                <th className="p-3.5">Turi & Chegirma</th>
                <th className="p-3.5">Biriktirilgan mahsulotlar</th>
                <th className="p-3.5">Ko'rishlar</th>
                <th className="p-3.5">Holati</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="p-3.5">
                    <div className="relative h-14 w-24 overflow-hidden rounded-xl bg-navy-950 border border-navy-100 shrink-0">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <p className="font-bold text-navy-900 text-sm line-clamp-1">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-navy-900/60 line-clamp-1 mt-0.5">{item.subtitle}</p>
                    )}
                    <span className="text-[11px] text-navy-900/40 mt-1 block">
                      {new Date(item.published_at || item.created_at).toLocaleDateString("uz-UZ")}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${
                          TYPE_CONFIG[item.type].badgeClass
                        }`}
                      >
                        {TYPE_CONFIG[item.type].icon} {TYPE_CONFIG[item.type].label}
                      </span>
                      {item.discount_percent && (
                        <div className="text-[11px] font-extrabold text-danger">
                          -{item.discount_percent}% chegirma
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    {item.product_ids && item.product_ids.length > 0 ? (
                      <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
                        <Package size={13} className="text-amber-700" />
                        <span>{item.product_ids.length} ta soat</span>
                      </div>
                    ) : (
                      <span className="text-xs text-navy-900/40">Biriktirilmagan</span>
                    )}
                  </td>
                  <td className="p-3.5 font-semibold text-xs text-navy-900">
                    👁 {item.views_count?.toLocaleString("uz-UZ") || 0}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleNews(item.id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                        item.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {item.is_active ? "Faol" : "Nofaol"}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <a
                        href={`/news/${item.slug || item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50 text-navy-700 transition"
                        title="Saytda ko'rish"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50 text-navy-700 transition"
                        title="Tahrirlash"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="rounded-lg border border-red-100 p-1.5 text-danger hover:bg-red-50 transition"
                        title="O'chirish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Aksiya / Yangilikni tahrirlash" : "Yangi aksiya / e'lon yaratish"}
        width="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImageUploader
            value={form.image_url}
            onChange={(v) => setForm((f) => ({ ...f, image_url: v }))}
            label="Reklama / Aksiya rasmi (Banner) *"
            aspect="aspect-video"
            maxSize={1920}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-navy-900">E'lon turi *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NewsType }))}
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-semibold text-navy-900 outline-none focus:border-navy-900 bg-white"
              >
                <option value="aksiya">🔥 Aksiya (Chegirma va sotilmagan mahsulotlar)</option>
                <option value="yangilik">📰 Yangilik (Do'kon xabari / Kolleksiya)</option>
                <option value="reklama">📢 Reklama (Telegram / Maxsus banner)</option>
                <option value="tavsiya">💡 Tavsiya (Foydali maslahat)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-navy-900">
                E'tibor belgisi / Badge (Ixtiyoriy)
              </label>
              <input
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                placeholder="masalan: Aksiya -25%, Yangi, TOP"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-medium text-navy-900 outline-none focus:border-navy-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-navy-900">Sarlavha (Title) *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="E'lon yoki aksiyaning jozibali sarlavhasi..."
              className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-medium text-navy-900 outline-none focus:border-navy-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-navy-900">
              Qisqa anons (Subtitle)
            </label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="Bosh sahifada ko'rinadigan qisqa anons..."
              className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-medium text-navy-900 outline-none focus:border-navy-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-navy-900">
              Batafsil matn / Mazmuni *
            </label>
            <textarea
              required
              rows={3}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Batafsil ma'lumot, aksiya shartlari, yetkazib berish..."
              className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-medium text-navy-900 outline-none focus:border-navy-900"
            />
          </div>

          {/* ======================================================== */}
          {/* SOTILMAGAN / TANLANGAN MAHSULOTLARGA CHEGIRMA BERISH */}
          {/* ======================================================== */}
          <div className="rounded-2xl border-2 border-[#C5A059]/40 bg-gradient-to-b from-[#FCFAF7] to-white p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C5A059]/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <Package className="text-[#C5A059]" size={18} />
                  Aksiyada ishtirok etuvchi soatlar va Chegirma berish
                </h3>
                <p className="text-xs text-navy-900/60 mt-0.5">
                  Sotilmagan yoki tanlangan soatlarni belgilang va ularga maxsus aksiya chegirmasini qo'llang
                </p>
              </div>

              {/* Chegirma foizi inputi */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-navy-900">Chegirma:</span>
                <div className="relative w-24">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={form.discount_percent}
                    onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                    placeholder="25"
                    className="w-full rounded-xl border border-navy-200 bg-white pr-7 pl-3 py-1.5 text-sm font-bold text-danger outline-none focus:border-danger"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-extrabold text-navy-400">%</span>
                </div>
              </div>
            </div>

            {/* Checkbox: apply discount */}
            {form.discount_percent && Number(form.discount_percent) > 0 && form.product_ids.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-950 border border-amber-200">
                <input
                  id="apply-discount-check"
                  type="checkbox"
                  checked={form.applyDiscountToProducts}
                  onChange={(e) => setForm((f) => ({ ...f, applyDiscountToProducts: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="apply-discount-check" className="font-semibold cursor-pointer">
                  Tanlangan {form.product_ids.length} ta soatning saytdagi haqiqiy narxiga -{form.discount_percent}% chegirma hisoblanib, eski narx bilan avtomatik qo'llansin.
                </label>
              </div>
            )}

            {/* Product selection tabs & search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setProdTab("all")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    prodTab === "all" ? "bg-navy-900 text-white" : "bg-white border border-navy-100 text-navy-900/70"
                  }`}
                >
                  Barchasi ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProdTab("unsold")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    prodTab === "unsold" ? "bg-[#5E3023] text-white" : "bg-white border border-navy-100 text-navy-900/70"
                  }`}
                >
                  Omborda ko'p soatlar (Sotilmagan)
                </button>
                <button
                  type="button"
                  onClick={() => setProdTab("selected")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    prodTab === "selected" ? "bg-emerald-700 text-white" : "bg-white border border-navy-100 text-navy-900/70"
                  }`}
                >
                  Tanlanganlar ({form.product_ids.length})
                </button>
              </div>

              <div className="relative sm:w-60">
                <input
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Soat nomi yoki brend..."
                  className="w-full rounded-lg border border-navy-200 bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-navy-900"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-navy-400" />
              </div>
            </div>

            {/* Scrollable Products List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-navy-100 rounded-xl border border-navy-200 bg-white">
              {filteredModalProducts.map((p) => {
                const isSelected = form.product_ids.includes(p.id);
                const discountNum = Number(form.discount_percent) || 0;
                const discountedPrice = discountNum > 0 ? Math.round((p.price * (100 - discountNum)) / 100) : null;

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProductSelection(p.id)}
                    className={`flex items-center gap-3 p-2.5 hover:bg-navy-50/70 transition cursor-pointer ${
                      isSelected ? "bg-amber-50/50" : ""
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        isSelected
                          ? "bg-[#5E3023] border-[#5E3023] text-white"
                          : "border-navy-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-navy-50 border border-navy-100">
                      {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-navy-900 truncate">{p.name}</span>
                        {p.brand && (
                          <span className="rounded bg-navy-100 px-1.5 py-0.2 text-[10px] font-semibold text-navy-700 shrink-0">
                            {p.brand}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-navy-900/60 mt-0.5">
                        <span>SKU: {p.sku || "—"}</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-700">Omborda: {p.stock} dona</span>
                      </div>
                    </div>

                    {/* Price and Preview */}
                    <div className="text-right shrink-0">
                      {discountedPrice ? (
                        <div>
                          <span className="text-xs font-bold text-danger">
                            {formatSom(discountedPrice)}
                          </span>
                          <span className="block text-[10px] text-navy-400 line-through">
                            {formatSom(p.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-navy-900">{formatSom(p.price)}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredModalProducts.length === 0 && (
                <div className="p-8 text-center text-xs text-navy-400">
                  Mos keluvchi soatlar topilmadi.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-navy-900">
                Havola / Link (Ixtiyoriy)
              </label>
              <input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="/products?sale=1 yoki bo'sh qoldiring"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-medium text-navy-900 outline-none focus:border-navy-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-navy-900">Tugma matni</label>
              <input
                value={form.button_text}
                onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
                placeholder="Aksiyani ko'rish / Xarid qilish"
                className="w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-medium text-navy-900 outline-none focus:border-navy-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="news-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-navy-300 text-navy-900 focus:ring-navy-900"
            />
            <label htmlFor="news-active" className="text-sm font-semibold text-navy-900 cursor-pointer">
              Faol (Saytda va bosh sahifada ko'rinsin)
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#5E3023] hover:bg-[#462016] border border-[#C5A059]/40 px-6 py-2.5 text-sm font-bold text-white transition shadow-md shadow-[#5E3023]/25 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin text-[#C5A059]" />}
              <span>{isSubmitting ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="E'lonni o'chirish"
        width="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navy-900/80">
            Haqiqatan ham <strong className="text-navy-900">&ldquo;{deletingItem?.title}&rdquo;</strong> nomli e'lonni o'chirmoqchimisiz?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingItem(null)}
              className="rounded-xl border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 transition shadow-xs disabled:opacity-50"
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

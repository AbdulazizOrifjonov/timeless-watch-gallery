"use client";

import { useState, useMemo } from "react";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Percent,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/context/ToastContext";
import { Promocode, PromoDiscountType } from "@/types/database";
import { formatSom } from "@/lib/utils";

const EMPTY_PROMO = {
  code: "",
  discount_type: "percent" as PromoDiscountType,
  discount_value: "10",
  min_order_amount: "2000000",
  max_discount_amount: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

export default function AdminPromocodesPage() {
  const { promocodes, addPromocode, updatePromocode, deletePromocode, togglePromocode } = useStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promocode | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<Promocode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PROMO);

  const filtered = useMemo(() => {
    return promocodes.filter((p) => {
      if (search && !p.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && p.discount_type !== typeFilter) return false;
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      return true;
    });
  }, [promocodes, search, typeFilter, statusFilter]);

  const activeCount = promocodes.filter((p) => p.is_active).length;
  const totalUsed = promocodes.reduce((sum, p) => sum + (p.used_count || 0), 0);
  const percentPromos = promocodes.filter((p) => p.discount_type === "percent");
  const avgPercent = percentPromos.length > 0
    ? Math.round(percentPromos.reduce((s, p) => s + p.discount_value, 0) / percentPromos.length)
    : 0;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_PROMO);
    setModalOpen(true);
  }

  function openEdit(p: Promocode) {
    setEditing(p);
    setForm({
      code: p.code,
      discount_type: p.discount_type,
      discount_value: String(p.discount_value),
      min_order_amount: String(p.min_order_amount),
      max_discount_amount: p.max_discount_amount ? String(p.max_discount_amount) : "",
      usage_limit: p.usage_limit ? String(p.usage_limit) : "",
      expires_at: p.expires_at ? p.expires_at.slice(0, 10) : "",
      is_active: p.is_active,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload: Partial<Promocode> = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value) || 0,
        min_order_amount: Number(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active,
      };

      if (editing) {
        await updatePromocode(editing.id, payload);
        showToast("Promokod muvaffaqiyatli yangilandi!", "success");
      } else {
        await addPromocode(payload);
        showToast("Yangi promokod muvaffaqiyatli yaratildi!", "success");
      }
      setModalOpen(false);
    } catch (err) {
      showToast("Promokodni saqlashda xatolik yuz berdi", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyCode(code: string, id: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      showToast("Promokod nusxalandi!", "info");
      setTimeout(() => setCopiedId(null), 1800);
    }
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Promokod kodi bo'yicha qidirish..." />
      <div className="p-3.5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Promokodlar</h1>
            <p className="text-sm text-navy-900/50">
              Chegirma promokodlarini yaratish, boshqarish va minimal xarid summasini belgilash
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition shadow-xs"
          >
            <Plus size={16} /> Yangi promokod yaratish
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Ticket} label="Jami promokodlar" value={promocodes.length} color="bg-info" />
          <StatCard icon={CheckCircle2} label="Faol promokodlar" value={activeCount} color="bg-success" />
          <StatCard icon={Clock} label="Ishlatilganlar soni" value={totalUsed} color="bg-purple-600" />
          <StatCard icon={Percent} label="O'rtacha chegirma" value={`${avgPercent}%`} color="bg-amber-500" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white p-3 shadow-2xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kodni qidirish (masalan: GRAND10)..."
            className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm outline-none sm:w-64 focus:border-navy-900 font-mono uppercase"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-navy-100 px-3 py-2 text-sm outline-none bg-white text-navy-900 font-medium"
            >
              <option value="all">Barcha turlar</option>
              <option value="percent">Foizli (%)</option>
              <option value="fixed">Belgilangan summa (so'm)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-navy-100 px-3 py-2 text-sm outline-none bg-white text-navy-900 font-medium"
            >
              <option value="all">Barcha holatlar</option>
              <option value="active">Faqat faol</option>
              <option value="inactive">Faqat nofaol</option>
            </select>
          </div>
        </div>

        {/* MOBIL KO'RINISH: Telefonlar uchun Promokodlar kartalari */}
        <div className="md:hidden space-y-3">
          {filtered.map((p) => {
            const isExpired = p.expires_at && new Date(p.expires_at).getTime() < Date.now();
            return (
              <div key={p.id} className="rounded-xl border border-navy-100 bg-white p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold tracking-wider text-navy-950 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200/80">
                      {p.code}
                    </span>
                    <button
                      onClick={() => copyCode(p.code, p.id)}
                      title="Kodni nusxalash"
                      className="p-1.5 rounded-lg border border-navy-100 text-navy-900/60 hover:text-navy-900 hover:bg-navy-50 transition"
                    >
                      {copiedId === p.id ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                    </button>
                  </div>

                  <span className="inline-flex items-center font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                    {p.discount_type === "percent" ? `-${p.discount_value}%` : `-${formatSom(p.discount_value)}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-navy-50">
                  <div>
                    <span className="text-navy-900/40 block text-[11px]">Min. buyurtma:</span>
                    <span className="font-medium text-navy-900">
                      {p.min_order_amount > 0 ? formatSom(p.min_order_amount) : "Cheklovsiz"}
                    </span>
                  </div>
                  <div>
                    <span className="text-navy-900/40 block text-[11px]">Ishlatildi:</span>
                    <span className="font-medium text-navy-900">
                      {p.used_count || 0} / {p.usage_limit ? `${p.usage_limit} ta` : "Cheksiz"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => togglePromocode(p.id)}
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
                      className="flex items-center gap-1 rounded-lg border border-navy-200/80 bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 transition"
                    >
                      <Pencil size={13} className="text-navy-700" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      onClick={() => setDeletingPromo(p)}
                      title="O'chirish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-navy-100 bg-white p-8 text-center text-sm text-navy-900/40">
              Promokodlar topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL: Katta ekranlar uchun */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50/70 text-xs font-semibold text-navy-900/60 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Promokod</th>
                <th className="p-3.5">Chegirma</th>
                <th className="p-3.5">Minimal xarid summasi</th>
                <th className="p-3.5">Ishlatildi / Cheklov</th>
                <th className="p-3.5">Muddati</th>
                <th className="p-3.5">Holat</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((p) => {
                const isExpired = p.expires_at && new Date(p.expires_at).getTime() < Date.now();
                return (
                  <tr key={p.id} className="hover:bg-navy-50/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold tracking-wider text-navy-900 bg-navy-50 px-2.5 py-1 rounded-md border border-navy-200/80">
                          {p.code}
                        </span>
                        <button
                          onClick={() => copyCode(p.code, p.id)}
                          title="Kodni nusxalash"
                          className="text-navy-900/40 hover:text-navy-900 transition p-1"
                        >
                          {copiedId === p.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                          {p.discount_type === "percent" ? `${p.discount_value}%` : formatSom(p.discount_value)}
                        </span>
                        {p.max_discount_amount && p.max_discount_amount > 0 && (
                          <span className="text-[11px] text-navy-900/50">
                            (max: {formatSom(p.max_discount_amount)})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-navy-900">
                      {p.min_order_amount > 0 ? (
                        <span className="font-semibold text-navy-950">{formatSom(p.min_order_amount)} dan yuqori</span>
                      ) : (
                        <span className="text-navy-900/40">Cheklov yo'q (0 so'm)</span>
                      )}
                    </td>

                    <td className="p-3.5 text-navy-900/70">
                      <span className="font-bold text-navy-900">{p.used_count || 0}</span>
                      <span className="text-navy-900/40"> / {p.usage_limit ? `${p.usage_limit} ta` : "Cheksiz"}</span>
                    </td>

                    <td className="p-3.5">
                      {p.expires_at ? (
                        <span className={`text-xs font-medium ${isExpired ? "text-danger line-through" : "text-navy-900"}`}>
                          {new Date(p.expires_at).toLocaleDateString("uz-UZ")}
                          {isExpired && " (Tugagan)"}
                        </span>
                      ) : (
                        <span className="text-xs text-navy-900/40">Muddatsiz</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => togglePromocode(p.id)}
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

                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          title="Tahrirlash"
                          className="rounded-lg border border-navy-100 p-1.5 text-navy-700 hover:bg-navy-50 hover:text-navy-950 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingPromo(p)}
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-navy-900/40">
                    Promokodlar topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Promokodni tahrirlash" : "Yangi promokod yaratish"}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-900">
                Promokod kodi *
              </label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                placeholder="Masalan: GRAND10, NAVROZ, YANGI"
                className="w-full rounded-lg border border-navy-200 px-3.5 py-2.5 text-sm font-mono font-bold uppercase tracking-wider outline-none focus:border-navy-900"
              />
              <p className="mt-1 text-xs text-navy-900/50">
                Xaridor ushbu kodni savatchada kiritadi (katta harflar bilan).
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-900">
                Chegirma turi *
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as PromoDiscountType }))}
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-navy-900"
              >
                <option value="percent">Foizda (%)</option>
                <option value="fixed">Belgilangan summa (so'm)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-900">
                Chegirma miqdori * {form.discount_type === "percent" ? "(%)" : "(so'm)"}
              </label>
              <input
                required
                type="number"
                min="1"
                max={form.discount_type === "percent" ? "99" : undefined}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.discount_type === "percent" ? "10" : "200000"}
                className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-navy-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-900">
                Minimal xarid summasi (so'm) *
              </label>
              <input
                required
                type="number"
                min="0"
                step="50000"
                value={form.min_order_amount}
                onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                placeholder="2000000"
                className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-navy-900"
              />
              <p className="mt-1 text-xs text-navy-900/50">
                Masalan: 2 000 000 so'm (xaridor kamida shu summada mahsulot tanlaganda promokod ishlaydi).
              </p>
            </div>

            {form.discount_type === "percent" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-900">
                  Maksimal chegirma limiti (ixtiyoriy)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.max_discount_amount}
                  onChange={(e) => setForm((f) => ({ ...f, max_discount_amount: e.target.value }))}
                  placeholder="Masalan: 500000"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-900">
                Foydalanish cheklovi (dona)
              </label>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                placeholder="Cheksiz bo'lsa bo'sh qoldiring"
                className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-navy-900">
                Amal qilish muddati (sana)
              </label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm outline-none focus:border-navy-900 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-4 sm:col-span-2">
              <input
                id="promo-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-navy-300 text-navy-900 focus:ring-navy-900"
              />
              <label htmlFor="promo-active" className="text-sm font-medium text-navy-900 cursor-pointer">
                Faol (xaridorlar ishlatishi mumkin)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin text-[#C5A059]" />}
              <span>{isSubmitting ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yaratish"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingPromo}
        onClose={() => setDeletingPromo(null)}
        title="Promokodni o'chirish"
        width="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-navy-900/80">
            Haqiqatan ham <strong className="text-navy-900 font-mono">&ldquo;{deletingPromo?.code}&rdquo;</strong> promokodini o'chirmoqchimisiz?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingPromo(null)}
              className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={async () => {
                if (deletingPromo && !isDeleting) {
                  setIsDeleting(true);
                  try {
                    await deletePromocode(deletingPromo.id);
                    showToast("Promokod muvaffaqiyatli o'chirildi", "info");
                    setDeletingPromo(null);
                  } catch (err) {
                    showToast("O'chirishda xatolik yuz berdi", "error");
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
              className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 transition shadow-xs disabled:opacity-50"
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


"use client";

import Image from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import { useState } from "react";
import { Folder, CheckCircle2, PauseCircle, ListTree, Pencil, Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useStore } from "@/lib/store";
import { useToast } from "@/context/ToastContext";
import { Category } from "@/types/database";

const EMPTY_FORM = { name: "", description: "", image_url: null as string | null, is_active: true };

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory: storeDeleteCategory } = useStore();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  async function deleteCategory(id: string) {
    if (confirm("Rostdan ham ushbu kategoriyani o'chirmoqchimisiz?")) {
      setDeletingId(id);
      try {
        await storeDeleteCategory(id);
        showToast("Kategoriya muvaffaqiyatli o'chirildi", "info");
      } catch (err) {
        showToast("O'chirishda xatolik yuz berdi", "error");
      } finally {
        setDeletingId(null);
      }
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "", image_url: c.image_url, is_active: c.is_active });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        showToast("Kategoriya muvaffaqiyatli yangilandi!", "success");
      } else {
        await addCategory(form);
        showToast("Yangi kategoriya qo'shildi!", "success");
      }
      setModalOpen(false);
    } catch (err) {
      showToast("Kategoriyani saqlashda xatolik yuz berdi", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Kategoriyalarni qidirish..." />
      <div className="p-3.5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Kategoriyalar</h1>
            <p className="text-sm text-navy-900/50">Mahsulot kategoriyalarini boshqarish, qo'shish, tahrirlash va o'chirish</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi kategoriya qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Folder} label="Jami kategoriyalar" value={categories.length} change="+2" color="bg-info" />
          <StatCard icon={CheckCircle2} label="Faol kategoriyalar" value={categories.filter((c) => c.is_active).length} change="+1" color="bg-success" />
          <StatCard icon={PauseCircle} label="Nofaol kategoriyalar" value={categories.filter((c) => !c.is_active).length} change="-1" color="bg-orange-500" />
          <StatCard icon={ListTree} label="Jami mahsulotlar" value={products.length} change="+28" color="bg-purple-600" />
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kategoriya nomi bo'yicha qidirish..."
          className="mb-4 w-full max-w-md rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
        />

        {/* MOBIL KO'RINISH: Telefonlar uchun kategoriyalar kartalari */}
        <div className="md:hidden space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border border-navy-100 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-navy-50 border border-navy-100">
                  {c.image_url ? (
                    <SafeImage src={c.image_url} fallbackSrc="/placeholder.png" alt={c.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-navy-300">
                      <Tag size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-navy-900 text-sm">{c.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-danger border border-red-200"}`}>
                      {c.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  {c.description && <p className="text-xs text-navy-900/60 line-clamp-1 mt-0.5">{c.description}</p>}
                  <p className="text-xs text-navy-900/40 mt-1">
                    {products.filter((p) => p.category_id === c.id).length} ta mahsulot
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-navy-50 pt-2.5">
                <button
                  onClick={() => openEdit(c)}
                  className="flex items-center gap-1 rounded-lg border border-navy-200/80 bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 transition"
                >
                  <Pencil size={13} className="text-navy-700" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  onClick={() => deleteCategory(c.id)}
                  disabled={deletingId === c.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-red-100 transition disabled:opacity-50"
                  title="O'chirish"
                >
                  {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-navy-100 bg-white p-8 text-center text-sm text-navy-900/40">
              Kategoriya topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Kategoriya nomi</th>
                <th className="p-3">Tavsif</th>
                <th className="p-3">Mahsulotlar soni</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="p-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-navy-50">
                      {c.image_url && <SafeImage src={c.image_url} fallbackSrc="/placeholder.png" alt={c.name} fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-navy-900">{c.name}</td>
                  <td className="p-3 text-navy-900/60">{c.description}</td>
                  <td className="p-3">{products.filter((p) => p.category_id === c.id).length}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${c.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                      {c.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50" title="Tahrirlash"><Pencil size={14} /></button>
                      <button
                        onClick={() => deleteCategory(c.id)}
                        disabled={deletingId === c.id}
                        className="rounded-lg border border-red-100 p-1.5 text-danger hover:bg-red-50 disabled:opacity-50"
                        title="O'chirish"
                      >
                        {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} label="Kategoriya rasmi" />
          <div>
            <label className="mb-1 block text-sm font-medium">Nomi *</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tavsif</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input id="cat-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            <label htmlFor="cat-active" className="text-sm">Faol</label>
          </div>
          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" disabled={isSubmitting} onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium disabled:opacity-50">Bekor qilish</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin text-[#C5A059]" />}
              <span>{isSubmitting ? "Saqlanmoqda..." : editing ? "Saqlash" : "Qo'shish"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


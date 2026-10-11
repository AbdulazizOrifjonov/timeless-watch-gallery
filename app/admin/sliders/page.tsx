"use client";

import Image from "next/image";
import { useState } from "react";
import { Images, Eye, EyeOff, ListOrdered, Pencil, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useStore } from "@/lib/store";
import { Slider } from "@/types/database";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  image_url: null as string | null,
  button_text: "",
  link: "",
  is_active: true,
};

export default function AdminSlidersPage() {
  const { sliders, addSlider, updateSlider, deleteSlider: storeDeleteSlider, reorderSlider } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Slider | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const sorted = [...sliders].sort((a, b) => a.sort_order - b.sort_order);

  function deleteSlider(id: string) {
    if (confirm("Rostdan ham ushbu sliderni o'chirmoqchimisiz?")) {
      storeDeleteSlider(id);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(s: Slider) {
    setEditing(s);
    setForm({
      title: s.title,
      subtitle: s.subtitle ?? "",
      image_url: s.image_url,
      button_text: s.button_text ?? "",
      link: s.link ?? "",
      is_active: s.is_active,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) return;
    const payload = { ...form, image_url: form.image_url as string };
    if (editing) {
      updateSlider(editing.id, payload);
    } else {
      addSlider({ ...payload, sort_order: sliders.length + 1 });
    }
    setModalOpen(false);
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Sliderlarni qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Sliderlar</h1>
            <p className="text-sm text-navy-900/50">Bosh sahifadagi sliderlarni boshqarish, qo'shish va tahrirlash</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi slider qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Images} label="Jami sliderlar" value={sliders.length} change="+1" color="bg-info" />
          <StatCard icon={Eye} label="Faol sliderlar" value={sliders.filter((s) => s.is_active).length} change="+1" color="bg-success" />
          <StatCard icon={EyeOff} label="Nofaol sliderlar" value={sliders.filter((s) => !s.is_active).length} change="-1" color="bg-danger" />
          <StatCard icon={ListOrdered} label="Jami tartib" value={sliders.length} color="bg-purple-600" />
        </div>

        {/* MOBIL KO'RINISH: Telefonlar uchun chiroyli Slider kartalari (Tahrirlash va O'chirish doim ko'rinadi) */}
        <div className="md:hidden space-y-4">
          {sorted.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xs">
              {/* Slider Banner Prevyusi */}
              <div className="relative h-44 w-full bg-navy-950">
                {s.image_url ? (
                  <Image src={s.image_url} alt={s.title} fill className="object-cover opacity-80" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-navy-400">
                    <Images size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent" />

                {/* Yuqori qism: Tartib va Holat */}
                <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
                  <span className="rounded-md bg-navy-900/80 backdrop-blur-xs border border-white/20 px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                    № {s.sort_order}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateSlider(s.id, { is_active: !s.is_active })}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs transition ${
                      s.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-300 border border-white/20"
                    }`}
                  >
                    {s.is_active ? "Faol" : "Nofaol"}
                  </button>
                </div>

                {/* Banner ichidagi matnlar */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-bold leading-tight drop-shadow-xs line-clamp-1">{s.title}</h3>
                  {s.subtitle && (
                    <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">{s.subtitle}</p>
                  )}
                  {s.button_text && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/20 backdrop-blur-xs border border-white/30 px-2 py-0.5 text-[11px] font-semibold text-white">
                      <span>{s.button_text}</span>
                      <span>→</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Boshqaruv paneli: Tartib ko'chirish va Tahrirlash/O'chirish */}
              <div className="flex items-center justify-between p-3 border-t border-navy-50">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-navy-900/50 font-medium">Tartib:</span>
                  <div className="flex items-center rounded-lg border border-navy-200/80 bg-navy-50">
                    <button
                      onClick={() => reorderSlider(s.id, "up")}
                      title="Yuqoriga"
                      className="p-1.5 text-navy-700 hover:text-navy-950 transition active:scale-90"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <span className="px-1 text-xs font-bold text-navy-900">{s.sort_order}</span>
                    <button
                      onClick={() => reorderSlider(s.id, "down")}
                      title="Pastga"
                      className="p-1.5 text-navy-700 hover:text-navy-950 transition active:scale-90"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex items-center gap-1 rounded-lg border border-navy-200/80 bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 transition active:scale-95"
                  >
                    <Pencil size={13} className="text-navy-700" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => deleteSlider(s.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-red-100 transition active:scale-95"
                    title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="rounded-xl border border-navy-100 bg-white p-8 text-center text-sm text-navy-900/40">
              Sliderlar topilmadi.
            </div>
          )}
        </div>

        {/* DESKTOP JADVAL: Katta ekranlar uchun to'liq jadval */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-2xs">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Sarlavha</th>
                <th className="p-3">Tavsif</th>
                <th className="p-3">Tugma</th>
                <th className="p-3">Tartib</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {sorted.map((s) => (
                <tr key={s.id} className="hover:bg-navy-50/40 transition-colors">
                  <td className="p-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded-lg bg-navy-900">
                      {s.image_url && <Image src={s.image_url} alt={s.title} fill className="object-cover opacity-80" />}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-navy-900">{s.title}</td>
                  <td className="p-3 text-navy-900/60 max-w-xs truncate">{s.subtitle}</td>
                  <td className="p-3">
                    <span className="rounded bg-navy-50 px-2 py-1 text-xs">{s.button_text}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => reorderSlider(s.id, "up")} className="rounded border border-navy-100 p-1 hover:bg-navy-50"><ChevronUp size={13} /></button>
                      <span className="font-semibold text-xs">{s.sort_order}</span>
                      <button onClick={() => reorderSlider(s.id, "down")} className="rounded border border-navy-100 p-1 hover:bg-navy-50"><ChevronDown size={13} /></button>
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateSlider(s.id, { is_active: !s.is_active })}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                    >
                      {s.is_active ? "Faol" : "Nofaol"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50 text-navy-700" title="Tahrirlash"><Pencil size={14} /></button>
                      <button onClick={() => deleteSlider(s.id)} className="rounded-lg border border-red-100 p-1.5 text-danger hover:bg-red-50" title="O'chirish"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-info/5 p-4 text-sm text-navy-900/70">
          <Images size={18} className="mt-0.5 shrink-0 text-info" />
          <p>Tavsiya etilgan rasm o'lchami: 1920 × 600 piksel. Format: JPG, PNG. Maksimal hajm: 2MB.</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sliderni tahrirlash" : "Yangi slider qo'shish"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader 
            value={form.image_url} 
            onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} 
            label="Slider rasmi *" 
            aspect="aspect-video" 
            maxSize={1920}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Sarlavha *</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tavsif</label>
            <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tugma matni</label>
              <input value={form.button_text} onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tugma havolasi</label>
              <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/products" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="slider-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            <label htmlFor="slider-active" className="text-sm">Faol (bosh sahifada ko'rinadi)</label>
          </div>
          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800">{editing ? "Saqlash" : "Qo'shish"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


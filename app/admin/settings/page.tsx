"use client";

import { Settings, Store, Bell, Lock } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Sozlamalarni qidirish..." />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">Sozlamalar</h1>
          <p className="text-sm text-navy-900/50">Do'kon sozlamalarini boshqarish</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-navy-100 p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold text-navy-900"><Store size={18} /> Do'kon ma'lumotlari</div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block font-medium">Do'kon nomi</label>
                <input defaultValue="Timeless — The Watch Gallery" className="w-full rounded-lg border border-navy-100 px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block font-medium">Telefon</label>
                <input defaultValue="+998 90 123 45 67" className="w-full rounded-lg border border-navy-100 px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block font-medium">Email</label>
                <input defaultValue="info@uzoelektro.uz" className="w-full rounded-lg border border-navy-100 px-3 py-2.5" />
              </div>
              <button className="rounded-lg bg-navy-900 px-5 py-2.5 text-white">Saqlash</button>
            </div>
          </div>

          <div className="rounded-xl border border-navy-100 p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold text-navy-900"><Bell size={18} /> Bildirishnomalar</div>
            <div className="space-y-3 text-sm">
              {["Yangi buyurtma haqida xabar berish", "Mahsulot tugaganda ogohlantirish", "Yangi mijoz ro'yxatdan o'tganda xabar berish"].map((label) => (
                <label key={label} className="flex items-center justify-between">
                  <span>{label}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-8" />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-navy-100 p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold text-navy-900"><Lock size={18} /> Xavfsizlik</div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block font-medium">Joriy parol</label>
                <input type="password" className="w-full rounded-lg border border-navy-100 px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-1 block font-medium">Yangi parol</label>
                <input type="password" className="w-full rounded-lg border border-navy-100 px-3 py-2.5" />
              </div>
              <button className="rounded-lg bg-navy-900 px-5 py-2.5 text-white">Parolni yangilash</button>
            </div>
          </div>

          <div className="rounded-xl border border-navy-100 p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold text-navy-900"><Settings size={18} /> Umumiy</div>
            <p className="text-sm text-navy-900/50">
              Timeless — The Watch Gallery v1.0.0 — Next.js asosida qurilgan, to'liq mustaqil ishlaydi.
              Supabase ulanishi ixtiyoriy: ulash uchun <code className="rounded bg-navy-50 px-1.5 py-0.5">.env.local</code> faylida
              kalitlarni kiriting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


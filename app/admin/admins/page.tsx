"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldCheck, Trash2, UserCog, Users2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { useAuth } from "@/lib/auth";

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "moderator" | "content_admin" | "super_admin";
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  moderator: "Moderator",
  content_admin: "Kontent admin",
};

function loadAll(): StoredUser[] {
  try {
    const raw = localStorage.getItem("gws_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AdminAdminsPage() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "moderator" as StoredUser["role"] });
  
  // Need useAuth to check if super_admin
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  function refresh() {
    setUsers(loadAll().filter((u) => u.role !== "customer"));
  }

  useEffect(() => { 
    if (user) {
      if (user.role === "super_admin") {
        setIsSuperAdmin(true);
        refresh();
      }
    }
  }, [user]);

  if (!user) return null;
  if (!isSuperAdmin) {
    return (
      <div className="p-10 text-center text-navy-900/50">
        <ShieldCheck size={48} className="mx-auto mb-4 text-danger opacity-50" />
        <h2 className="text-xl font-bold">Ruxsat yo'q</h2>
        <p>Bu sahifani faqat Super Admin ko'ra oladi.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = loadAll();
    if (all.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      alert("Bu email allaqachon mavjud.");
      return;
    }
    const newAdmin: StoredUser = {
      id: "admin_" + Date.now(),
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password || "123456",
      role: form.role,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("gws_users", JSON.stringify([...all, newAdmin]));
    setModalOpen(false);
    setForm({ fullName: "", email: "", phone: "", password: "", role: "moderator" });
    refresh();
  }

  function removeAdmin(id: string) {
    const all = loadAll().filter((u) => u.id !== id);
    localStorage.setItem("gws_users", JSON.stringify(all));
    refresh();
  }

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Adminlarni qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Adminlar</h1>
            <p className="text-sm text-navy-900/50">Adminlarni boshqarish, yangi admin qo'shish va ularning huquqlarini sozlash</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi admin qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Users2} label="Jami adminlar" value={users.length} color="bg-info" />
          <StatCard icon={ShieldCheck} label="Super adminlar" value={users.filter((u) => u.role === "super_admin").length} color="bg-success" />
          <StatCard icon={UserCog} label="Moderatorlar" value={users.filter((u) => u.role === "moderator").length} color="bg-purple-600" />
          <StatCard icon={UserCog} label="Kontent adminlar" value={users.filter((u) => u.role === "content_admin").length} color="bg-orange-500" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Foydalanuvchi</th>
                <th className="p-3">Roli</th>
                <th className="p-3">Telefon raqam</th>
                <th className="p-3">Parol</th>
                <th className="p-3">Ro'yxatdan o'tgan sana</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-navy-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{u.fullName.slice(0,1)}</div>
                      <div>
                        <p className="font-medium text-navy-900">{u.fullName}</p>
                        <p className="text-xs text-navy-900/40">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${u.role === "super_admin" ? "bg-danger/10 text-danger" : u.role === "moderator" ? "bg-info/10 text-info" : "bg-purple-100 text-purple-700"}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="p-3">{u.phone || "-"}</td>
                  <td className="p-3 font-mono text-xs text-navy-900/70">{u.password}</td>
                  <td className="p-3 text-navy-900/50">{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-3">
                    <button onClick={() => removeAdmin(u.id)} disabled={u.role === "super_admin"} className="rounded-lg border border-navy-100 p-1.5 text-danger hover:bg-danger/5 disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-navy-100 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-navy-900/60" size={20} />
            <div>
              <p className="font-semibold text-navy-900">Admin huquqlari haqida</p>
              <p className="text-sm text-navy-900/50">Har bir adminning huquqlari uning roliga qarab belgilanadi. Super admin barcha huquqlarga ega.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yangi admin qo'shish">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">To'liq ism *</label>
            <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefon</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Parol</label>
            <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Parol kiriting" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rol</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StoredUser["role"] }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
              <option value="moderator">Moderator</option>
              <option value="content_admin">Kontent admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800">Qo'shish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


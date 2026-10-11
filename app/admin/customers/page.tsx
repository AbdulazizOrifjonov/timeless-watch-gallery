"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

interface StoredUser {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const { orders } = useStore();
  const [customers, setCustomers] = useState<StoredUser[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from("app_users").select("*").order("created_at", { ascending: false });
      if (data) {
        const mapped = data.map(u => ({
          id: u.id,
          fullName: u.full_name,
          phone: u.phone,
          role: u.role,
          createdAt: u.created_at
        }));
        setCustomers(mapped.filter((u) => u.role === "user"));
      }
    }
    fetchUsers();
  }, [supabase]);

  return (
    <div>
      <AdminHeader title="Timeless — The Watch Gallery Admin" searchPlaceholder="Mijozlarni qidirish..." />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">Mijozlar (Foydalanuvchilar)</h1>
          <p className="text-sm text-navy-900/50">Saytdan ro'yxatdan o'tgan mijozlar ro'yxati</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Jami mijozlar" value={customers.length} color="bg-info" />
          <StatCard icon={Users} label="Jami buyurtmalar" value={orders.length} color="bg-success" />
          <StatCard icon={Users} label="Faol xaridorlar" value={new Set(orders.map((o) => o.user_id)).size} color="bg-purple-600" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Ism</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Ro'yxatdan o'tgan sana</th>
                <th className="p-3">Buyurtmalar soni</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-navy-50 hover:bg-navy-50/30 transition">
                  <td className="p-3 font-medium text-navy-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-900/50">
                      <Users size={16} />
                    </div>
                    {c.fullName}
                  </td>
                  <td className="p-3 font-mono">{c.phone}</td>
                  <td className="p-3 text-navy-900/50">{new Date(c.createdAt).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-3 font-medium text-navy-900">{orders.filter((o) => o.user_id === c.id).length}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-navy-900/40">Hali mijozlar ro'yxatdan o'tmagan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronRight, Package } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { formatSom, cn } from "@/lib/utils";

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const { orders, profileSidebarOpen } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.push("/login");
  }, [ready, user, router]);

  if (!user) return null;

  const cleanUserPhone = user.phone ? user.phone.replace(/\D/g, "") : "";
  const myOrders = orders.filter(
    (o) =>
      (o.user_id && o.user_id === user.id) ||
      (cleanUserPhone && o.phone && o.phone.replace(/\D/g, "") === cleanUserPhone)
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header active="/orders" isAuthed />
      <main className="flex-1">
        <div className={cn("container-shop grid gap-8 pb-16 transition-all duration-500 ease-in-out", profileSidebarOpen ? "grid-cols-1 lg:grid-cols-[280px_1fr]" : "grid-cols-1 lg:grid-cols-[0px_1fr] lg:gap-0 max-w-5xl pt-8")}>
          
          <div className={cn("pt-8 transition-all duration-500 ease-in-out", profileSidebarOpen ? "lg:border-r lg:border-navy-100 lg:pr-8 opacity-100" : "opacity-0 border-transparent pr-0 pointer-events-none")}>
            <div className="w-[248px] h-full">
              <AccountSidebar />
            </div>
          </div>

        <div className={cn(profileSidebarOpen && "pt-8")}>
          <h1 className="mb-6 font-serif text-3xl font-bold text-navy-900">Buyurtmalar</h1>

          {myOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-100 py-20 text-center bg-navy-50/50">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-navy-100/50 text-navy-900/30">
                <Package size={32} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-navy-900">Buyurtmalar yo'q</h3>
              <p className="mb-6 text-navy-900/50">Hali hech qanday buyurtma bermagansiz.</p>
              <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold-500 hover:-translate-y-0.5 shadow-lg">
                Xarid qilishni boshlash <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-5 transition-all hover:border-navy-200 hover:shadow-lg hover:shadow-navy-900/5 touch-target"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900 transition-colors group-hover:bg-navy-900 group-hover:text-gold-500">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-navy-900 text-lg">#{o.order_number}</p>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="text-sm font-medium text-navy-900/50">
                        {new Date(o.created_at).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className="mx-2">•</span>
                        {o.items?.length ?? 0} ta mahsulot
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-navy-50 pt-4 sm:border-0 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy-900/40 mb-1">Jami summa</p>
                      <p className="font-bold text-navy-900 text-lg">{formatSom(o.total)}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-900 transition-transform group-hover:bg-navy-100 group-hover:translate-x-1">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}

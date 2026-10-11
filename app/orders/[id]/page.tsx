"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useStore } from "@/lib/store";
import { formatSom } from "@/lib/utils";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id || o.order_number === id);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/profile" isAuthed />
      <div className="container-shop py-4 text-sm text-navy-900/50">
        <Link href="/">Bosh sahifa</Link> <span className="mx-1">›</span>
        <Link href="/orders">Buyurtmalarim</Link> <span className="mx-1">›</span>
        <span className="text-navy-900">#{order?.order_number ?? id}</span>
      </div>

      <div className="container-shop grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[260px_1fr]">
        <AccountSidebar />

        {!order ? (
          <div className="rounded-xl border border-dashed border-navy-100 py-20 text-center text-navy-900/50">
            Buyurtma topilmadi.
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl font-bold text-navy-900">Buyurtma #{order.order_number}</h1>
                <p className="text-sm text-navy-900/50">
                  {new Date(order.created_at).toLocaleString("uz-UZ")}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                {(order.items ?? []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-navy-100 p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                      {item.product_image && (
                        <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-navy-900/50">{item.quantity} x {formatSom(item.price)}</p>
                    </div>
                    <p className="font-semibold">{formatSom(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <aside className="h-fit space-y-3 rounded-xl border border-navy-100 p-5 text-sm">
                <h2 className="font-bold text-navy-900">Yetkazib berish</h2>
                <p><span className="text-navy-900/50">Ism:</span> {order.full_name}</p>
                <p><span className="text-navy-900/50">Telefon:</span> {order.phone}</p>
                <p><span className="text-navy-900/50">Manzil:</span> {order.address}</p>
                {order.note && <p><span className="text-navy-900/50">Izoh:</span> {order.note}</p>}
                <div className="border-t border-navy-100 pt-3 space-y-1">
                  <div className="flex justify-between"><span className="text-navy-900/50">Mahsulotlar</span><span>{formatSom(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-navy-900/50">Yetkazib berish</span><span>{order.delivery_fee ? formatSom(order.delivery_fee) : "Bepul"}</span></div>
                  <div className="flex justify-between text-base font-bold"><span>Jami</span><span>{formatSom(order.total)}</span></div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

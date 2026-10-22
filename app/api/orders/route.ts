import { NextResponse } from "next/server";
import { getServerOrders, addServerOrder, updateServerOrderStatus } from "@/lib/server-orders";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types/database";

export async function GET() {
  try {
    let orders = getServerOrders();

    // Check if Supabase has additional orders
    try {
      const { data: dbOrders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(dbOrders) && dbOrders.length > 0) {
        const mappedDbOrders: Order[] = dbOrders.map((row: any) => ({
          id: row.id,
          order_number: row.order_number || `ORD-${String(row.id).slice(0, 6)}`,
          user_id: row.user_id || null,
          full_name: row.customer_name || row.full_name || "Mijoz",
          phone: row.phone || "",
          address: row.address || "",
          note: row.note || null,
          subtotal: Number(row.total_amount || row.subtotal || row.total || 0),
          delivery_fee: Number(row.delivery_fee || 0),
          discount: Number(row.discount || 0),
          total: Number(row.total_amount || row.total || 0),
          status: (row.status as OrderStatus) || "new",
          items: Array.isArray(row.items)
            ? row.items.map((it: any) => ({
                id: it.id || it.product_id || "",
                order_id: row.id,
                product_id: it.product_id || it.id || "",
                product_name: it.product_name || it.name || "Mahsulot",
                product_image: it.product_image || it.image || null,
                price: Number(it.price || 0),
                quantity: Number(it.quantity || 1),
              }))
            : [],
          created_at: row.created_at || new Date().toISOString(),
        }));

        // Merge without duplicating
        const merged = [...orders];
        for (const dbo of mappedDbOrders) {
          const idx = merged.findIndex((o) => o.id === dbo.id || o.order_number === dbo.order_number);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...dbo };
          } else {
            merged.push(dbo);
          }
        }
        orders = merged.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch {
      // Supabase not available, use server file/cache
    }

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order: Order = {
      id: body.id || `ord_${Date.now()}`,
      order_number: body.order_number || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: body.user_id || null,
      full_name: body.full_name || body.customer_name || "Mijoz",
      phone: body.phone || "",
      address: body.address || "",
      note: body.note || null,
      subtotal: Number(body.subtotal || body.total || 0),
      delivery_fee: Number(body.delivery_fee || 0),
      discount: Number(body.discount || 0),
      total: Number(body.total || 0),
      status: (body.status as OrderStatus) || "new",
      items: Array.isArray(body.items) ? body.items : [],
      created_at: body.created_at || new Date().toISOString(),
    };

    const saved = addServerOrder(order);

    // Also attempt Supabase upsert
    try {
      await supabase.from("orders").upsert({
        id: saved.id,
        order_number: saved.order_number,
        customer_name: saved.full_name,
        phone: saved.phone,
        address: saved.address,
        total_amount: saved.total,
        status: saved.status,
        items: saved.items,
        created_at: saved.created_at,
      });
    } catch {
      // Supabase optional
    }

    return NextResponse.json({ success: true, order: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    const ok = updateServerOrderStatus(id, status as OrderStatus);

    // Also update in Supabase if reachable
    try {
      await supabase.from("orders").update({ status }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

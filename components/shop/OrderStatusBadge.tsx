import { OrderStatus } from "@/types/database";

const CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "Yangi", className: "bg-info/10 text-info" },
  processing: { label: "Tasdiqlangan", className: "bg-info/10 text-info" },
  shipped: { label: "Yetkazib berilmoqda", className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Yetkazib berildi", className: "bg-success/10 text-success" },
  cancelled: { label: "Bekor qilingan", className: "bg-danger/10 text-danger" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = CONFIG[status] ?? CONFIG.new;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}

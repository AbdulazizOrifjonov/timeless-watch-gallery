import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color = "bg-info",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  color?: string;
}) {
  const positive = change?.trim().startsWith("+") || change?.trim().startsWith("↑");
  return (
    <div className="rounded-xl border border-navy-100 p-5">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white", color)}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-navy-900/50">{label}</p>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      {change && (
        <p className={cn("mt-1 text-xs font-medium", positive ? "text-success" : "text-danger")}>
          {change} <span className="text-navy-900/40">O&apos;tgan oyga nisbatan</span>
        </p>
      )}
    </div>
  );
}

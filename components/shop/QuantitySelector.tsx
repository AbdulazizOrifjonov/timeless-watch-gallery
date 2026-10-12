"use client";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 h-9 select-none shrink-0">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100/80 hover:bg-[#5E3023] hover:text-white text-navy-900 border border-navy-200/80 text-base font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
        disabled={value <= min}
        aria-label="Kamaytirish"
      >
        −
      </button>
      <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-navy-200 text-sm font-bold text-navy-900 tabular-nums shadow-2xs">
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5E3023] hover:bg-[#462016] text-white text-base font-bold transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-2xs"
        disabled={value >= max}
        aria-label="Ko'paytirish"
      >
        +
      </button>
    </div>
  );
}

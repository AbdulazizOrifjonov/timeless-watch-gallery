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
    <div className="flex items-center gap-1.5 h-10">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-full w-10 items-center justify-center rounded-lg bg-navy-900 text-xl font-medium text-white transition hover:bg-navy-800 disabled:opacity-40"
        disabled={value <= min}
      >
        -
      </button>
      <div className="flex h-full w-12 shrink-0 items-center justify-center rounded-lg border border-navy-900/20 text-[15px] font-bold text-navy-900">
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-full w-10 items-center justify-center rounded-lg bg-navy-900 text-xl font-medium text-white transition hover:bg-navy-800 disabled:opacity-40"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

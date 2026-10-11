"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/store";

export function ImageUploader({
  value,
  onChange,
  label = "Rasm",
  aspect = "aspect-square",
  maxSize = 800,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  aspect?: string;
  maxSize?: number;
}) {
  return (
    <div className="w-24 sm:w-32 shrink-0">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {value ? (
        <div className={`relative ${aspect} w-full max-w-[220px] overflow-hidden rounded-lg border border-navy-100`}>
          <Image src={value} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger shadow"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          className={`flex ${aspect} w-full max-w-[220px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-100 text-navy-900/40 hover:border-navy-900/30`}
        >
          <ImagePlus size={22} />
          <span className="text-xs">Rasm yuklash</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await fileToDataUrl(file, maxSize);
              onChange(dataUrl);
            }}
          />
        </label>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { ImagePlus, X, Link as LinkIcon } from "lucide-react";
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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const handleApplyUrl = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setShowUrlInput(false);
      setUrlValue("");
    }
  };

  return (
    <div className="w-28 sm:w-36 shrink-0">
      <label className="mb-1 block text-xs font-semibold text-navy-800">{label}</label>
      {value ? (
        <div className={`relative ${aspect} w-full overflow-hidden rounded-xl border border-navy-200 bg-navy-50 shadow-xs group`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="O'chirish"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
          >
            <X size={13} />
          </button>
        </div>
      ) : showUrlInput ? (
        <div className={`flex ${aspect} w-full flex-col justify-between rounded-xl border border-navy-200 bg-white p-2`}>
          <div className="text-[10px] font-medium text-navy-600">URL kiriting:</div>
          <input
            type="text"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://..."
            className="w-full rounded border border-navy-200 px-1.5 py-1 text-xs outline-none focus:border-navy-900"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyUrl();
              }
            }}
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleApplyUrl}
              className="flex-1 rounded bg-navy-900 py-1 text-[10px] font-semibold text-white"
            >
              Saqlash
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="rounded bg-navy-100 px-1.5 py-1 text-[10px] text-navy-700"
            >
              Bekor
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex ${aspect} w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-navy-200 bg-navy-50/50 hover:bg-navy-50 transition p-2`}>
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-navy-900/60 hover:text-navy-900">
            <ImagePlus size={20} className="text-[#5E3023]" />
            <span className="text-[10px] font-semibold mt-1">Fayl tanlash</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file, maxSize);
                if (dataUrl) onChange(dataUrl);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-1 text-[9px] text-[#5E3023] hover:underline"
          >
            <LinkIcon size={9} />
            <span>yoki URL</span>
          </button>
        </div>
      )}
    </div>
  );
}

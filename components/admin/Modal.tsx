"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-xl",
  fullscreenMobile = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  fullscreenMobile?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div
        className={`max-h-[92vh] w-full ${width} ${
          fullscreenMobile ? "modal-fullscreen-mobile" : ""
        } overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl custom-scrollbar`}
      >
        {/* Sticky Header so close button and title are always reachable */}
        <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b border-navy-100 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:-mt-6 sm:mb-5 sm:px-6 sm:py-4">
          <h3 className="font-bold text-navy-950 text-base sm:text-lg leading-tight truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700 hover:bg-navy-100 active:scale-95 transition"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

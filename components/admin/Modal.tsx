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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`max-h-[90vh] w-full ${width} ${fullscreenMobile ? "modal-fullscreen-mobile" : ""} overflow-y-auto rounded-2xl bg-white p-6 shadow-xl lg:rounded-2xl lg:p-6`}>
        <div className="mb-5 flex items-center justify-between lg:mb-5">
          <h3 className="text-lg font-bold text-navy-900 text-responsive-base">{title}</h3>
          <button onClick={onClose} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 hover:bg-navy-100 transition touch-target" aria-label="Yopish">
            <X size={20} />
          </button>
          <button onClick={onClose} className="hidden lg:flex rounded-full p-1.5 hover:bg-navy-50">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
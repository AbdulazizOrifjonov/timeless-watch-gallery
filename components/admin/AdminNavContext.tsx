"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface AdminNavContextType {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}

const AdminNavContext = createContext<AdminNavContextType | null>(null);

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Sahifa o'zgarganda mobil menyuni avtomatik yopish
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape tugmasi bosilganda yopish va fon scrollini bloklash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <AdminNavContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        toggleMobile: () => setMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav(): AdminNavContextType {
  const ctx = useContext(AdminNavContext);
  if (!ctx) {
    return {
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleMobile: () => {},
    };
  }
  return ctx;
}

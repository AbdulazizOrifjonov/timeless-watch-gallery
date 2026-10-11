"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

interface WishlistContextValue {
  ids: string[];
  toggle: (productId: string) => void;
  isWished: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "gws_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { showToast } = useToast();
  const { products, ready } = useStore();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setIds([]);
      setHydrated(true);
      return;
    }
    try {
      const raw =
        localStorage.getItem(`${STORAGE_KEY}_${user.id}`) ||
        localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
      else setIds([]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [user]);

  // Bazadan o'chirilgan yoki mavjud bo'lmagan mahsulotlarni avtomatik tozalash
  useEffect(() => {
    if (!hydrated || !ready || products.length === 0 || !user) return;
    setIds((prev) => {
      const valid = prev.filter((id) => products.some((p) => p.id === id));
      if (valid.length !== prev.length) return valid;
      return prev;
    });
  }, [hydrated, ready, products, user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(ids));
  }, [ids, hydrated, user]);

  const toggle = useCallback((productId: string) => {
    if (!user) {
      showToast("Sevimlilarga qo'shish uchun avval ro'yxatdan o'ting yoki tizimga kiring!", "warning");
      router.push("/login?redirect=wishlist");
      return;
    }
    setIds((prev) => {
      const isIncluded = prev.includes(productId);
      if (isIncluded) {
        showToast("Sevimlilardan olib tashlandi", "info");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Sevimlilarga qo'shildi", "success");
        return [...prev, productId];
      }
    });
  }, [user, router, showToast]);

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    if (user) {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
      } catch {}
    }
  }, [user]);

  const isWished = useCallback((productId: string) => (user ? ids.includes(productId) : false), [ids, user]);

  const contextValue = useMemo(
    () => ({ ids, toggle, isWished, remove, clear }),
    [ids, toggle, isWished, remove, clear]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

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
import { CartItem } from "@/types/database";
import { useToast } from "@/context/ToastContext";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gws_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { showToast } = useToast();
  const { products, ready } = useStore();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setItems([]);
      setHydrated(true);
      return;
    }
    try {
      const raw =
        localStorage.getItem(`${STORAGE_KEY}_${user.id}`) ||
        localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      else setItems([]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [user]);

  // Bazadan o'chirilgan yoki mavjud bo'lmagan mahsulotlarni avtomatik tozalash
  useEffect(() => {
    if (!hydrated || !ready || products.length === 0 || !user) return;
    setItems((prev) => {
      const valid = prev.filter((i) => products.some((p) => p.id === i.productId));
      if (valid.length !== prev.length) {
        return valid;
      }
      return prev;
    });
  }, [hydrated, ready, products, user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(items));
  }, [items, hydrated, user]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    if (!user) {
      showToast("Xarid qilish uchun avval ro'yxatdan o'ting yoki tizimga kiring!", "warning");
      router.push("/login?redirect=cart");
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, quantity }];
    });
    showToast("Mahsulot savatchaga qo'shildi", "success");
  }, [user, router, showToast]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    showToast("Mahsulot savatchadan olib tashlandi", "info");
  }, [showToast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    if (user) {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
      } catch {}
    }
  }, [user]);

  const isInCart = useCallback(
    (productId: string) => (user ? items.some((i) => i.productId === productId) : false),
    [items, user]
  );

  const itemCount = useMemo(
    () => (user ? items.reduce((sum, i) => sum + i.quantity, 0) : 0),
    [items, user]
  );

  const contextValue = useMemo(
    () => ({ items, itemCount, addItem, removeItem, updateQuantity, clear, isInCart }),
    [items, itemCount, addItem, removeItem, updateQuantity, clear, isInCart]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

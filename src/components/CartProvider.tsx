"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CartDrawer } from "./CartDrawer";
import { IconCheck } from "./icons";

export interface CartItem {
  key: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string;
  size?: string;
  color?: string;
  qty: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isHydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (
    item: Omit<CartItem, "key" | "qty"> & { qty?: number }
  ) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "abdeen_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, isHydrated]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "key" | "qty"> & { qty?: number }) => {
      const qty = Math.min(Math.max(item.qty ?? 1, 1), Math.max(item.stock, 1));
      const key = [item.slug, item.size ?? "", item.color ?? ""].join("|");
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key
              ? { ...i, qty: Math.min(i.qty + qty, Math.max(i.stock, 1)) }
              : i
          );
        }
        return [...prev, { ...item, key, qty }];
      });
      showToast("تمت الإضافة إلى السلة");
    },
    [showToast]
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.key === key
            ? { ...i, qty: Math.min(Math.max(qty, 0), Math.max(i.stock, 1)) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return {
      items,
      count,
      subtotal,
      isHydrated,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      removeItem,
      setQty,
      clearCart,
      toast,
      showToast,
    };
  }, [items, drawerOpen, toast, addItem, removeItem, setQty, clearCart, showToast, isHydrated]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[90] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2"
      >
        {toast && (
          <div className="animate-fade-up flex items-center justify-center gap-2.5 rounded-2xl bg-ink px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-ink/30">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-bright">
              <IconCheck className="h-3.5 w-3.5 text-white" />
            </span>
            {toast}
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

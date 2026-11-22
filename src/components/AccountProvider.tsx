"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  createdAt: string;
}

interface AccountCtx {
  customer: Customer | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  update: (data: {
    name?: string;
    phone?: string;
    city?: string;
    address?: string;
    password?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AccountContext = createContext<AccountCtx | null>(null);
const TOKEN_KEY = "abdeen_cust_token";

export function AccountProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsReady(true);
      return;
    }
    fetch("/api/account", { headers: { "x-customer-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (!d.customer) window.localStorage.removeItem(TOKEN_KEY);
        setCustomer(d.customer ?? null);
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || "فشل تسجيل الدخول");
    window.localStorage.setItem(TOKEN_KEY, d.token);
    setCustomer(d.customer);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "google", idToken }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || "فشل الدخول عبر جوجل");
    window.localStorage.setItem(TOKEN_KEY, d.token);
    setCustomer(d.customer);
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; phone: string; password: string }) => {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...data }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "فشل إنشاء الحساب");
      window.localStorage.setItem(TOKEN_KEY, d.token);
      setCustomer(d.customer);
    },
    []
  );

  const update = useCallback(
    async (data: {
      name?: string;
      phone?: string;
      city?: string;
      address?: string;
      password?: string;
    }) => {
      const token = window.localStorage.getItem(TOKEN_KEY);
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-customer-token": token ?? "",
        },
        body: JSON.stringify(data),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "فشل الحفظ");
      setCustomer(d.customer);
    },
    []
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      isReady,
      login,
      loginWithGoogle,
      register,
      update,
      logout,
    }),
    [customer, isReady, login, loginWithGoogle, register, update, logout]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountCtx {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}

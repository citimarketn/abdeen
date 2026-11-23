"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import {
  IconBox,
  IconDashboard,
  IconGear,
  IconKey,
  IconLock,
  IconLogout,
  IconMail,
  IconShield,
  IconStar,
  IconStore,
  IconTag,
  IconTruck,
  IconUser,
  IconUsers,
} from "@/components/icons";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { cn } from "@/lib/utils";
import DashboardPanel from "./panels/Dashboard";
import ProductsPanel from "./panels/Products";
import OrdersPanel from "./panels/Orders";
import ReviewsPanel from "./panels/Reviews";
import CategoriesPanel from "./panels/Categories";
import TeamPanel from "./panels/Team";
import StaffTeamPanel from "./panels/StaffTeam";
import OutboxPanel from "./panels/Outbox";
import LegalPanel from "./panels/Legal";
import SettingsPanel from "./panels/Settings";

type Perm =
  | "dashboard"
  | "products"
  | "orders"
  | "reviews"
  | "categories"
  | "settings";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: "owner" | "supervisor";
  permissions: string[];
}

interface LoginConfig {
  ownerEmail: string;
  demoPassword: string;
  demoCodes: string[];
  googleConfigured: boolean;
  googleClientId: string;
}

const TABS: Array<{
  key: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactNode;
  perm: Perm | "owner";
}> = [
  { key: "dashboard", label: "لوحة المعلومات", icon: IconDashboard, perm: "dashboard" },
  { key: "products", label: "المنتجات", icon: IconBox, perm: "products" },
  { key: "orders", label: "الطلبات", icon: IconStore, perm: "orders" },
  { key: "reviews", label: "التقييمات", icon: IconStar, perm: "reviews" },
  { key: "categories", label: "الأقسام", icon: IconTag, perm: "categories" },
  { key: "staff", label: "فريق العمل الميداني", icon: IconTruck, perm: "owner" },
  { key: "team", label: "المسؤولون والصلاحيات", icon: IconUsers, perm: "owner" },
  { key: "outbox", label: "البريد المُرسل", icon: IconMail, perm: "owner" },
  { key: "settings", label: "الإعدادات", icon: IconGear, perm: "settings" },
];

function canSee(profile: Profile, perm: Perm | "owner") {
  if (profile.role === "owner") return true;
  return perm !== "owner" && profile.permissions.includes(perm);
}

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("dashboard");

  // login state
  const [config, setConfig] = useState<LoginConfig | null>(null);
  const [step, setStep] = useState<"credentials" | "codes">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState(["", "", ""]);
  const [pendingAdminId, setPendingAdminId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<LoginConfig>("/api/admin/auth")
      .then((c) => {
        setConfig(c);
        setEmail(c.ownerEmail);
      })
      .catch(() => setConfig(null));
    if (!getToken()) {
      setChecking(false);
      return;
    }
    api<{ profile: Profile }>("/api/admin/me")
      .then((d) => setProfile(d.profile))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  const finish = useCallback((token: string, p: Profile) => {
    setToken(token);
    setProfile(p);
    setTab(p.role === "owner" ? "dashboard" : firstAllowed(p));
    setError(null);
  }, []);

  const sendPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api<{ ok: boolean; needCodes: boolean; adminId: number }>(
        "/api/admin/auth",
        { method: "POST", body: { step: "password", email, password } }
      );
      setPendingAdminId(res.adminId);
      setStep("codes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الدخول");
    } finally {
      setBusy(false);
    }
  };

  const sendCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api<{ ok: boolean; token: string; profile: Profile }>(
        "/api/admin/auth",
        {
          method: "POST",
          body: {
            step: "codes",
            adminId: pendingAdminId,
            code1: codes[0],
            code2: codes[1],
            code3: codes[2],
          },
        }
      );
      finish(res.token, res.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل التحقق");
    } finally {
      setBusy(false);
    }
  };

  const sendGoogle = async (idToken: string) => {
    setError(null);
    setBusy(true);
    try {
      const res = await api<{ ok: boolean; token: string; profile: Profile }>(
        "/api/admin/auth",
        { method: "POST", body: { step: "google", idToken } }
      );
      finish(res.token, res.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الدخول عبر جوجل");
      setBusy(false);
    }
  };

  const logout = () => {
    clearToken();
    setProfile(null);
    setStep("credentials");
    setPassword("");
    setCodes(["", "", ""]);
    setPendingAdminId(null);
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-deep">
        <p className="text-sm text-white/60">جارٍ التحقق…</p>
      </div>
    );
  }

  /* ---------------- LOGIN ---------------- */
  if (!profile) {
    return (
      <div className="relative grid min-h-screen place-items-center bg-navy-deep px-4 py-10">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="gold-hairline pointer-events-none absolute inset-x-0 top-0 h-px" />
        <div className="animate-fade-up relative w-full max-w-md rounded-3xl bg-paper p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="عابدين"
              className="h-14 w-14 rounded-full ring-2 ring-mint"
            />
            <div>
              <h1 className="font-display text-2xl font-black text-navy">
                لوحة تحكم عابدين
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-ink/45">
                <IconLock className="h-3 w-3 text-leaf" />
                منطقة محمية — للدخول المالك والمشرفين المخوّلين فقط
              </p>
            </div>
          </div>

          {step === "credentials" ? (
            <form onSubmit={sendPassword} className="mt-7 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base"
                  dir="ltr"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base"
                  dir="ltr"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-navy py-3.5 font-display text-sm font-bold text-white transition hover:bg-navy-deep disabled:opacity-50"
              >
                {busy ? "جارٍ التحقق…" : "متابعة"}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[10px] font-bold text-ink/35">أو</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              {config?.googleConfigured ? (
                <GoogleLoginButton
                  clientId={config.googleClientId}
                  onSuccess={sendGoogle}
                />
              ) : (
                <div className="mt-4">
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-line bg-paper px-4 py-3.5 text-xs font-bold text-ink/40"
                  >
                    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
                      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
                    </svg>
                    الدخول بحساب جوجل — غير مفعّل بعد
                  </button>
                  <p className="mt-2 text-center text-[10px] leading-5 text-ink/40">
                    للتفعيل: لوحة التحكم ← الإعدادات ← الأمان ← ضع معرّف
                    Google Client ID الخاص بك
                  </p>
                </div>
              )}

            
            </form>
          ) : (
            <form onSubmit={sendCodes} className="mt-7 space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-mint/70 px-4 py-3 text-xs font-bold text-leaf">
                <IconShield className="h-4 w-4 shrink-0" />
                خطوة أمان إضافية — أدخل أكواد الحماية الثلاثة
              </div>
              <div className="grid grid-cols-3 gap-3">
                {codes.map((c, i) => (
                  <input
                    key={i}
                    value={c}
                    onChange={(e) =>
                      setCodes((prev) =>
                        prev.map((v, j) => (j === i ? e.target.value : v))
                      )
                    }
                    placeholder={`الرمز ${i + 1}`}
                    className="input-base text-center font-mono tracking-[0.3em]"
                    dir="ltr"
                    maxLength={8}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {error && (
                <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf py-3.5 font-display text-sm font-bold text-white transition hover:bg-leaf/90 disabled:opacity-50"
              >
                <IconKey className="h-4 w-4" />
                {busy ? "جارٍ التحقق…" : "دخول آمن"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setCodes(["", "", ""]);
                  setError(null);
                }}
                className="w-full text-center text-xs font-bold text-ink/45 hover:text-ink"
              >
                → رجوع
              </button>
            </form>
          )}

          <Link
            href="/"
            className="mt-6 block text-center text-xs font-bold text-ink/40 hover:text-leaf"
          >
            ← العودة إلى المتجر
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- SHELL ---------------- */
  const visibleTabs = TABS.filter((t) => canSee(profile, t.perm));
  const active = visibleTabs.some((t) => t.key === tab) ? tab : visibleTabs[0]?.key;

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-l border-line bg-paper lg:w-60">
        <div className="flex items-center gap-2.5 border-b border-line px-3 py-4 lg:px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="عابدين"
            className="h-10 w-10 rounded-full ring-2 ring-mint"
          />
          <div className="hidden lg:block">
            <p className="font-display text-lg font-black leading-none text-navy">
              عابدين
            </p>
            <p className="mt-1 text-[9px] font-bold tracking-[0.2em] text-leaf">
              CONTROL PANEL
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2 lg:p-3">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition lg:justify-start",
                active === t.key
                  ? "bg-navy text-white shadow-lg shadow-navy/25"
                  : "text-ink/55 hover:bg-mint/70 hover:text-navy"
              )}
            >
              <t.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden lg:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line p-2 lg:p-3">
          <div className="hidden rounded-xl bg-mint/50 px-3 py-2.5 lg:block">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink/70">
              <IconUser className="h-3.5 w-3.5 text-leaf" />
              {profile.name}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-leaf">
              {profile.role === "owner" ? "مالك المتجر" : "مشرف"}
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-ink/55 transition hover:bg-mint/70 hover:text-navy lg:justify-start"
          >
            <IconStore className="h-4.5 w-4.5" />
            <span className="hidden lg:inline">عرض المتجر</span>
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-clay transition hover:bg-clay/10 lg:justify-start"
          >
            <IconLogout className="h-4.5 w-4.5" />
            <span className="hidden lg:inline">تسجيل خروج</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-cream/85 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-black text-ink">
              {TABS.find((t) => t.key === active)?.label}
            </h1>
            <span className="flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-xs font-bold text-ink/60 ring-1 ring-line">
              <IconUser className="h-3.5 w-3.5 text-leaf" />
              {profile.role === "owner" ? "مالك المتجر" : "مشرف"} · {profile.name}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {active === "dashboard" && (
            <DashboardPanel goTo={(t) => setTab(t)} />
          )}
          {active === "products" && <ProductsPanel />}
          {active === "orders" && <OrdersPanel />}
          {active === "reviews" && <ReviewsPanel />}
          {active === "categories" && <CategoriesPanel />}
          {active === "staff" && <StaffTeamPanel />}
          {active === "team" && <TeamPanel />}
          {active === "outbox" && <OutboxPanel />}
          {active === "legal" && <LegalPanel />}
          {active === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function firstAllowed(p: Profile) {
  return TABS.find((t) => canSee(p, t.perm))?.key ?? "dashboard";
}

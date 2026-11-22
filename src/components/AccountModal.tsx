"use client";

import { useEffect, useState } from "react";
import { useAccount } from "./AccountProvider";
import { useI18n } from "@/lib/i18n";
import GoogleLoginButton from "./GoogleLoginButton";
import { IconClose, IconShield, IconUser } from "./icons";
import { cn } from "@/lib/utils";

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export default function AccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { login, loginWithGoogle, register } = useAccount();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleCfg, setGoogleCfg] = useState<{ configured: boolean; clientId: string }>({
    configured: false,
    clientId: "",
  });

  useEffect(() => {
    if (!open) return;
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) =>
        setGoogleCfg({
          configured: Boolean(d.googleConfigured),
          clientId: d.googleClientId ?? "",
        })
      )
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "register") {
        await register({ name, email, phone, password });
      } else {
        await login(email, password);
      }
      setName("");
      setPassword("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل العملية");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async (idToken: string) => {
    setError(null);
    setBusy(true);
    try {
      await loginWithGoogle(idToken);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الدخول عبر جوجل");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
      <div className="animate-fade-up w-full max-w-sm rounded-3xl bg-paper shadow-2xl ring-1 ring-line">
        {/* Header */}
        <div className="relative rounded-t-3xl border-b border-line px-6 py-5 text-center">
          <button
            onClick={onClose}
            aria-label="close"
            className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full ring-1 ring-line transition hover:rotate-90"
          >
            <IconClose className="h-4 w-4" />
          </button>
          <span className="mx-auto block w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Abdeen"
              className="mx-auto h-12 w-12 rounded-full ring-2 ring-mint"
            />
          </span>
          <h2 className="font-display mt-2 flex items-center justify-center gap-2 text-xl font-black">
            {tab === "login" ? t("login") : t("register")}
            <IconUser className="h-5 w-5 text-leaf" />
          </h2>
          <p className="mt-1 text-xs text-ink/50">{t("memberBenefit")}</p>
        </div>

        <div className="px-6 py-5">
          {/* Protected data note */}
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-mint/70 px-3.5 py-2.5 text-[11px] font-bold leading-5 text-ink/65">
            <IconShield className="h-4 w-4 shrink-0 text-leaf" />
            {t("dataProtected")}
          </div>

          {/* Tabs */}
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-cream p-1 ring-1 ring-line">
            {(["login", "register"] as const).map((tb) => (
              <button
                key={tb}
                type="button"
                onClick={() => {
                  setTab(tb);
                  setError(null);
                }}
                className={cn(
                  "rounded-lg py-2.5 text-xs font-extrabold transition",
                  tab === tb
                    ? "bg-navy text-white shadow-md shadow-navy/25"
                    : "text-ink/45 hover:text-ink"
                )}
              >
                {t(tb)}
              </button>
            ))}
          </div>

          {/* Google (both tabs) */}
          {googleCfg.configured ? (
            <GoogleLoginButton clientId={googleCfg.clientId} onSuccess={onGoogle} />
          ) : (
            <button
              type="button"
              disabled
              title={t("googleUnset")}
              className="mb-1 flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border-2 border-line bg-paper px-4 py-3 text-sm font-bold text-ink/35"
            >
              <GoogleG className="h-5 w-5 opacity-40" />
              {t("googleBtn")}
            </button>
          )}

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[10px] font-bold text-ink/35">
              أو بالإيميل
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {tab === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("fullName")} *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-base"
                  maxLength={60}
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("email")} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                dir="ltr"
              />
            </div>
            {tab === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("phone")}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-base"
                  dir="ltr"
                  inputMode="tel"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("password")} *
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
              className="w-full rounded-xl bg-navy py-3.5 text-sm font-extrabold text-white transition hover:bg-navy-deep disabled:opacity-50"
            >
              {busy ? "…" : tab === "login" ? t("login") : t("register")}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setTab(tab === "login" ? "register" : "login");
              setError(null);
            }}
            className="mt-4 w-full text-center text-xs font-bold text-leaf hover:underline"
          >
            {tab === "login" ? t("noAccount") : t("haveAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}

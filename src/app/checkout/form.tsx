"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import {
  IconArrow,
  IconCard,
  IconCash,
  IconShield,
  IconTruck,
} from "@/components/icons";
import { CITIES, cn, formatPrice } from "@/lib/utils";
import { useI18n, T } from "@/lib/i18n";
import { useAccount } from "@/components/AccountProvider";

interface SettingsLite {
  freeShippingOver: number;
  shippingFee: number;
  freeShippingEnabled: boolean;
  currency: string;
  paymentNote: string;
  whatsapp: string;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { customer, isReady: accReady } = useAccount();
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const [settings, setSettings] = useState<SettingsLite | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "القاهرة",
    address: "",
    notes: "",
    payment: "cod",
  });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() =>
        setSettings({
          freeShippingOver: 1000,
          shippingFee: 50,
          freeShippingEnabled: true,
          currency: "ج.م",
          paymentNote: "",
          whatsapp: "",
        })
      );
  }, []);

  useEffect(() => {
    if (isHydrated && items.length === 0) router.replace("/shop");
  }, [isHydrated, items.length, router]);

  useEffect(() => {
    if (!accReady || !customer) return;
    setForm((f) => ({
      ...f,
      name: f.name || customer.name,
      phone: f.phone || (customer.phone ?? ""),
      city: f.city || (customer.city ?? "القاهرة"),
      address: f.address || (customer.address ?? ""),
      email: f.email || customer.email,
    }));
  }, [accReady, customer]);

  const currency = settings?.currency ?? "ج.م";
  const freeShip = settings?.freeShippingOver ?? 1000;
  const freeShipOn = settings?.freeShippingEnabled ?? true;
  const shipFee =
    !settings || subtotal === 0
      ? 0
      : freeShipOn && subtotal >= settings.freeShippingOver
        ? 0
        : settings.shippingFee;
  const total = subtotal + shipFee;

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(t("missingInfo"));
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            size: i.size,
            color: i.color,
            qty: i.qty,
          })),
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          city: form.city,
          address: form.address.trim(),
          payment: form.payment,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "تعذر إتمام الطلب");
      clearCart();
      router.push(`/order/${data.orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مجددًا");
      setSending(false);
    }
  };

  if (!isHydrated || items.length === 0 || !settings) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-ink/50">{t("preparing")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-ink/45">
        <Link href="/" className="hover:text-leaf">
          <T k="home" /></Link>
        <span>/</span>
        <span className="font-bold text-leaf">إتمام الطلب</span>
      </nav>

      <h1 className="font-display text-3xl font-black sm:text-4xl">
        إتمام الطلب
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        {t("checkoutSub")}
      </p>

      <form
        onSubmit={submit}
        className="mt-8 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]"
      >
        {/* Form */}
        <div className="space-y-6">
          <section className="rounded-3xl bg-paper p-6 ring-1 ring-line sm:p-7">
            <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-mint font-display text-sm font-black text-leaf">
                1
              </span>
              بيانات التوصيل
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("fullName")} *
                </label>
                <input
                  value={form.name}
                  onChange={set("name")}
                  placeholder="مثال: أحمد محمد"
                  className="input-base"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("phone")} *
                </label>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="tel"
                  placeholder="01xxxxxxxxx"
                  className="input-base"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("emailOpt")}
                </label>
                <input
                  value={form.email}
                  onChange={set("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="input-base"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("cityReq")} *
                </label>
                <select
                  value={form.city}
                  onChange={set("city")}
                  className="input-base cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("addressReq")} *
                </label>
                <textarea
                  value={form.address}
                  onChange={set("address")}
                  placeholder={t("addressPh")}
                  className="input-base min-h-20 resize-y"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  {t("notesLabel")}
                </label>
                <input
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder={t("notesPh")}
                  className="input-base"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-paper p-6 ring-1 ring-line sm:p-7">
            <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-mint font-display text-sm font-black text-leaf">
                2
              </span>
              {t("payMethod")}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition",
                  form.payment === "cod"
                    ? "border-leaf bg-mint/50"
                    : "border-line bg-paper hover:border-leaf/40"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.payment === "cod"}
                  onChange={set("payment")}
                  className="mt-1 accent-[#1da463]"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-extrabold">
                    <IconCash className="h-4.5 w-4.5 text-leaf" />
                    {t("cod")}
                  </span>
                  <span className="mt-1 block text-[11px] leading-5 text-ink/50">
                    {t("codDesc")}
                  </span>
                </span>
              </label>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition",
                  form.payment === "card"
                    ? "border-leaf bg-mint/50"
                    : "border-line bg-paper hover:border-leaf/40"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.payment === "card"}
                  onChange={set("payment")}
                  className="mt-1 accent-[#1da463]"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-extrabold">
                    <IconCard className="h-4.5 w-4.5 text-navy" />
                    {t("cardPay")}
                  </span>
                  <span className="mt-1 block text-[11px] leading-5 text-ink/50">
                    {t("cardDesc")}
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="rounded-3xl bg-paper p-6 ring-1 ring-line lg:sticky lg:top-40">
          <h2 className="font-display text-lg font-extrabold">
            {t("orderSummary")}
          </h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pe-1">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <span className="relative block h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-mint ring-1 ring-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute -top-0 -right-0 grid h-4.5 min-w-4.5 place-items-center rounded-bl-lg bg-ink px-1 text-[9px] font-black text-white">
                    {i.qty.toLocaleString("ar-EG")}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-xs font-bold">
                    {i.name}
                  </span>
                  <span className="text-[10px] text-ink/45">
                    {[
                      i.size && i.size !== "مقاس واحد" ? i.size : null,
                      i.color && i.color !== "متعدد" ? i.color : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </span>
                <span className="text-xs font-extrabold text-navy">
                  {formatPrice(i.price * i.qty, currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/55">{t("subtotal")}</dt>
              <dd className="font-bold">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="flex items-center gap-1.5 text-ink/55">
                <IconTruck className="h-4 w-4" />
                التوصيل
              </dt>
              <dd
                className={cn(
                  "font-bold",
                  shipFee === 0 && subtotal > 0 ? "text-leaf" : ""
                )}
              >
                {shipFee === 0 && subtotal > 0
                  ? "مجاني"
                  : formatPrice(shipFee, currency)}
              </dd>
            </div>
              {shipFee > 0 && freeShipOn && (
                <p className="rounded-lg bg-mint/70 px-3 py-2 text-[10px] font-bold text-leaf">
                  أضف {formatPrice(freeShip - subtotal, currency)} لتجيب توصيل
                  مجاني
                </p>
              )}
            <div className="flex items-center justify-between border-t border-line pt-3">
              <dt className="font-display text-base font-extrabold">
                الإجمالي
              </dt>
              <dd className="font-display text-2xl font-black text-navy">
                {formatPrice(total, currency)}
              </dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 rounded-xl bg-clay/10 px-4 py-3 text-xs font-bold text-clay">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-leaf py-4 font-display text-sm font-black text-white shadow-xl shadow-leaf/30 transition-all hover:-translate-y-0.5 hover:bg-leaf/90 disabled:opacity-60"
          >
            {sending ? t("confirming") : t("confirmOrder")}
            <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-ink/40">
            <IconShield className="h-3.5 w-3.5 text-leaf" />
            {t("secureNote")}
          </p>
        </aside>
      </form>
    </div>
  );
}

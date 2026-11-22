"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "@/components/AccountProvider";
import { useI18n } from "@/lib/i18n";
import { CITIES, formatDate, formatPrice } from "@/lib/utils";
import {
  IconBox,
  IconLogout,
  IconUser,
} from "@/components/icons";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

interface OrderLite {
  orderNo: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
}

export default function AccountView() {
  const { customer, isReady, update, logout } = useAccount();
  const { t, locale } = useI18n();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "القاهرة",
    address: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [orders, setOrders] = useState<OrderLite[]>([]);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone ?? "",
        city: customer.city ?? "القاهرة",
        address: customer.address ?? "",
        password: "",
      });
      fetch("/api/account/orders", {
        headers: { "x-customer-token": window.localStorage.getItem("abdeen_cust_token") ?? "" },
      })
        .then((r) => (r.ok ? r.json() : { orders: [] }))
        .then((d) => setOrders(d.orders ?? []))
        .catch(() => {});
    }
  }, [customer]);

  if (!isReady) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">
        …
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-mint">
          <IconUser className="h-9 w-9 text-leaf" />
        </span>
        <h1 className="font-display mt-5 text-2xl font-black">
          {t("noAccount")}
        </h1>
        <p className="mt-2 text-sm text-ink/55">{t("memberBenefit")}</p>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await update({
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        ...(form.password ? { password: form.password } : {}),
      });
      setMsg({ ok: true, text: t("saved") });
      setForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      {/* Profile header */}
      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-paper p-6 ring-1 ring-line">
        <span className="font-display grid h-16 w-16 place-items-center rounded-full bg-navy text-2xl font-black text-white">
          {customer.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-black">{customer.name}</h1>
          <p className="mt-0.5 truncate text-xs text-ink/45" dir="ltr">
            {customer.email}
          </p>
          <p className="mt-1 text-[11px] font-bold text-leaf">
            {t("memberSince")} {formatDate(customer.createdAt)}
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl bg-clay/10 px-4 py-2.5 text-xs font-extrabold text-clay transition hover:bg-clay hover:text-white"
        >
          <IconLogout className="h-4 w-4" />
          {t("signOut")}
        </button>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Profile form */}
        <form
          onSubmit={save}
          className="rounded-3xl bg-paper p-6 ring-1 ring-line"
        >
          <h2 className="font-display flex items-center gap-2 text-base font-extrabold">
            <IconUser className="h-4.5 w-4.5 text-leaf" />
            {t("profile")}
          </h2>
          <div className="mt-4 space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("fullName")}
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("phone")}
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-base"
                dir="ltr"
                inputMode="tel"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("city")}
              </label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-base cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("address")}
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-base min-h-20 resize-y"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/60">
                {t("password")} — {locale === "ar" ? "اتركها فارغة إذا لم تبدّلها" : "leave empty to keep"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-base"
                dir="ltr"
              />
            </div>
            {msg && (
              <p
                className={
                  msg.ok
                    ? "rounded-lg bg-leaf/15 px-3 py-2 text-xs font-bold text-leaf"
                    : "rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay"
                }
              >
                {msg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-leaf py-3.5 text-sm font-extrabold text-white transition hover:bg-leaf/90 disabled:opacity-50"
            >
              {saving ? "…" : t("save")}
            </button>
          </div>
        </form>

        {/* Orders */}
        <section className="rounded-3xl bg-paper ring-1 ring-line">
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display flex items-center gap-2 text-base font-extrabold">
              <IconBox className="h-4.5 w-4.5 text-leaf" />
              {t("myOrders")}
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-leaf hover:underline"
            >
              {t("keepShopping")} ←
            </Link>
          </header>
          {orders.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-ink/45">
              {t("noOrders")}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.orderNo}>
                  <Link
                    href={`/order/${o.orderNo}`}
                    className="flex items-center gap-3 px-6 py-4 transition hover:bg-mint/30"
                  >
                    <span className="font-mono text-xs font-black text-ink/50" dir="ltr">
                      {o.orderNo}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] text-ink/45">
                        {formatDate(o.createdAt)} · {o.itemsCount.toLocaleString("ar-EG")} {t("items")}
                      </span>
                    </span>
                    <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-extrabold text-leaf">
                      {ORDER_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                    <span className="font-display text-sm font-black text-navy">
                      {formatPrice(o.total, "ج.م")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

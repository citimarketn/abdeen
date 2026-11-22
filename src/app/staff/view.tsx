"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconTruck, IconWhatsApp } from "@/components/icons";
import {
  cn,
  formatPrice,
  timeAgo,
  ORDER_STATUS_LABELS,
} from "@/lib/utils";
import { buildOrderMessage, waLink } from "@/lib/orderMsg";

interface StaffMe {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: "field" | "manager";
  onDuty: boolean;
  dutyRequested: boolean;
  active: boolean;
}

interface OrderLite {
  id: number;
  orderNo: string;
  customerName: string;
  phone: string;
  city: string | null;
  address: string | null;
  payment: string;
  notes: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  assignedToStaffId: number | null;
  assignedToName: string | null;
  waNumber: string | null;
  createdAt: string;
  itemsCount: number;
  items: Array<{
    productName: string;
    options: string | null;
    price: number;
    qty: number;
  }>;
}

interface Inbox {
  me: StaffMe;
  orders: OrderLite[];
  onDutyTeammates: StaffMe[];
}

export default function StaffView() {
  const [data, setData] = useState<Inbox | null>(null);
  const [state, setState] = useState<"loading" | "noauth" | "ready" | "error">(
    "loading"
  );
  const [currency, setCurrency] = useState("ج.م");
  const [toast, setToast] = useState<string | null>(null);
  const [openOrder, setOpenOrder] = useState<number | null>(null);
  const [transferTarget, setTransferTarget] = useState<Record<number, string>>(
    {}
  );

  const load = useCallback(async () => {
    const token = window.localStorage.getItem("abdeen_cust_token");
    if (!token) {
      setState("noauth");
      return;
    }
    try {
      const [meRes, inRes, cfg] = await Promise.all([
        fetch("/api/staff/me", { headers: { "x-customer-token": token } }),
        fetch("/api/staff/inbox", { headers: { "x-customer-token": token } }),
        fetch("/api/settings").then((r) => r.json()),
      ]);
      if (!inRes.ok) {
        setState(meRes.ok ? "ready" : "noauth");
        const meD = await meRes.json();
        if (meRes.ok && meD.staff) {
          setData({ me: meD.staff, orders: [], onDutyTeammates: [] });
        }
        return;
      }
      const d = await inRes.json();
      setData(d);
      setCurrency(cfg.settings.currency ?? "ج.م");
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const msgFor = (o: OrderLite) =>
    buildOrderMessage(
      {
        orderNo: o.orderNo,
        customerName: o.customerName,
        phone: o.phone,
        city: o.city,
        address: o.address,
        payment: o.payment,
        notes: o.notes,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
        items: o.items,
      },
      { currency }
    );

  const setDuty = async (mode: "request" | "off") => {
    const token = window.localStorage.getItem("abdeen_cust_token");
    await fetch("/api/staff/duty", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-customer-token": token ?? "" },
      body: JSON.stringify({ mode }),
    });
    flash(mode === "request" ? "تم إرسال طلب التواجد — بانتظار موافقة المالك" : "تمت مغادرة الدوام");
    load();
  };

  const transfer = async (o: OrderLite) => {
    const targetId = Number(transferTarget[o.id]);
    if (!targetId) {
      flash("اختر الزميل المراد الترحيل إليه");
      return;
    }
    const token = window.localStorage.getItem("abdeen_cust_token");
    const res = await fetch("/api/staff/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-customer-token": token ?? "" },
      body: JSON.stringify({ orderId: o.id, toStaffId: targetId }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      flash(d.error ?? "تعذر الترحيل");
      return;
    }
    flash(`تم الترحيل إلى ${d.toName} — افتُح محادثة واتساب لإرسال التفاصيل`);
    window.open(waLink(d.waNumber, msgFor(o)), "_blank");
    load();
  };

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">
        جارٍ تحميل صندوق الوارد…
      </div>
    );
  }

  if (state === "noauth" || !data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-mint">
          <IconTruck className="h-9 w-9 text-leaf" />
        </span>
        <h1 className="font-display mt-5 text-2xl font-black">
          هذه الصفحة لفريق العمل والمسؤولين فقط
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          سجل دخولك بالإيميل المخوّل من المالك لعرض صندوق الوارد وإدارة الدوام.
        </p>
      </div>
    );
  }

  const { me, orders, onDutyTeammates } = data;
  const teammates = onDutyTeammates.filter((t) => t.id !== me.id);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-paper p-6 ring-1 ring-line">
        <span className="font-display grid h-14 w-14 place-items-center rounded-full bg-navy text-2xl font-black text-white">
          {me.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-black">صندوق وارد الفريق</h1>
          <p className="mt-0.5 text-xs text-ink/50">
            {me.name} ·{" "}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                me.role === "manager"
                  ? "bg-gold/15 text-gold"
                  : "bg-mint text-leaf"
              )}
            >
              {me.role === "manager" ? "مسؤول" : "فريق ميداني"}
            </span>
          </p>
        </div>

        {/* Duty control */}
        <div className="w-full rounded-2xl border-2 border-line p-4 sm:w-72">
          {me.onDuty ? (
            <>
              <p className="flex items-center gap-2 text-sm font-extrabold text-leaf">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-leaf" />
                متواجد في الدوام — تتلقى الطلبات
              </p>
              <button
                onClick={() => setDuty("off")}
                className="mt-3 w-full rounded-xl bg-cream py-2.5 text-xs font-extrabold text-ink/60 ring-1 ring-line transition hover:text-clay"
              >
                مغادرة الدوام
              </button>
            </>
          ) : me.dutyRequested ? (
            <p className="text-center text-sm font-extrabold text-gold">
              طلبك بانتظار موافقة المالك
            </p>
          ) : (
            <>
              <p className="text-center text-sm font-bold text-ink/50">
                لست في الدوام حاليًا
              </p>
              <button
                onClick={() => setDuty("request")}
                className="mt-3 w-full rounded-xl bg-leaf py-2.5 text-xs font-extrabold text-white transition hover:bg-leaf/90"
              >
                طلب التواجد في الدوام
              </button>
            </>
          )}
        </div>
      </div>

      {/* On-duty teammates */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold text-ink/45">
          المتواجدون الآن في الدوام:
        </span>
        {onDutyTeammates.length === 0 && (
          <span className="text-xs text-ink/35">لا أحد غيرك الآن</span>
        )}
        {onDutyTeammates.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-bold ring-1 ring-line"
          >
            <span className="h-2 w-2 rounded-full bg-leaf" />
            {t.name}
            {t.id === me.id && <span className="text-ink/35">(أنت)</span>}
          </span>
        ))}
      </div>

      {toast && (
        <div className="animate-fade-up mt-4 rounded-2xl bg-ink px-5 py-3.5 text-sm font-bold text-white">
          {toast}
        </div>
      )}

      {/* Inbox */}
      <div className="mt-6 space-y-3">
        {orders.length === 0 && (
          <div className="rounded-3xl bg-paper py-16 text-center text-sm text-ink/45 ring-1 ring-line">
            لا توجد طلبات بعد — أول طلب جديد هيبان هنا فورًا.
          </div>
        )}
        {orders.map((o) => {
          const open = openOrder === o.id;
          const mine = o.assignedToStaffId === me.id;
          return (
            <div
              key={o.id}
              className={cn(
                "overflow-hidden rounded-2xl bg-paper ring-1 transition",
                mine ? "ring-leaf/50" : "ring-line"
              )}
            >
              <button
                onClick={() => setOpenOrder(open ? null : o.id)}
                className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-start"
              >
                <span className="font-mono text-xs font-black text-ink/50" dir="ltr">
                  {o.orderNo}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-sm font-extrabold">
                    {o.customerName}
                  </span>
                  <span className="text-[11px] text-ink/45">
                    {timeAgo(o.createdAt)} · {o.itemsCount.toLocaleString("ar-EG")} قطعة · {formatPrice(o.total, currency)}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                    o.status === "new"
                      ? "bg-navy/10 text-navy"
                      : o.status === "cancelled"
                        ? "bg-clay/10 text-clay"
                        : "bg-mint text-leaf"
                  )}
                >
                  {ORDER_STATUS_LABELS[o.status] ?? o.status}
                </span>
                {o.assignedToName && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                      mine ? "bg-leaf text-white" : "bg-cream text-ink/55 ring-1 ring-line"
                    )}
                  >
                    استلمه: {o.assignedToName}
                  </span>
                )}
              </button>

              {open && (
                <div className="animate-fade-in border-t border-line bg-cream/50 px-5 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-xs leading-6 text-ink/70">
                      <p>
                        📞{" "}
                        <a href={`tel:${o.phone}`} className="font-bold text-leaf" dir="ltr">
                          {o.phone}
                        </a>
                      </p>
                      <p>
                        📍 {o.city} — {o.address}
                      </p>
                      <p>
                        💳 {o.payment === "cod" ? "الدفع عند الاستلام" : "بطاقة / محفظة"}
                      </p>
                      {o.notes && <p>📝 {o.notes}</p>}
                    </div>
                    <ul className="space-y-1 text-xs">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span className="line-clamp-1">
                            {it.productName}
                            {it.options ? ` (${it.options})` : ""} × {it.qty}
                          </span>
                          <span className="shrink-0 font-bold text-navy">
                            {formatPrice(it.price * it.qty, currency)}
                          </span>
                        </li>
                      ))}
                      <li className="flex justify-between border-t border-line pt-1.5 font-extrabold">
                        <span>
                          الإجمالي (توصيل: {o.shippingFee === 0 ? "مجاني" : formatPrice(o.shippingFee, currency)})
                        </span>
                        <span className="text-navy">{formatPrice(o.total, currency)}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {o.waNumber && (
                      <a
                        href={waLink(o.waNumber, msgFor(o))}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-leaf/90"
                      >
                        <IconWhatsApp className="h-4 w-4" />
                        إرسال التفاصيل على واتساب {o.assignedToName ?? ""}
                      </a>
                    )}
                    {teammates.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select
                          value={transferTarget[o.id] ?? ""}
                          onChange={(e) =>
                            setTransferTarget((t) => ({ ...t, [o.id]: e.target.value }))
                          }
                          className="input-base w-auto cursor-pointer py-2 text-xs font-bold"
                        >
                          <option value="">ترحيل إلى زميل…</option>
                          {teammates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} (في الدوام)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => transfer(o)}
                          className="rounded-xl bg-navy px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-navy-deep"
                        >
                          ترحيل
                        </button>
                      </div>
                    )}
                    <Link
                      href={`/order/${o.orderNo}`}
                      className="text-xs font-bold text-navy hover:underline"
                    >
                      عرض صفحة الطلب ←
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

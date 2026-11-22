"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { IconChevronDown, IconPhone } from "@/components/icons";
import {
  cn,
  formatPrice,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  timeAgo,
} from "@/lib/utils";

interface OrderRow {
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
  assignedToName: string | null;
  waNumber: string | null;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    options: string | null;
    price: number;
    qty: number;
    image: string | null;
  }>;
}

const statusStyles: Record<string, string> = {
  new: "bg-navy/10 text-navy",
  processing: "bg-gold/20 text-[#a8781a]",
  shipped: "bg-mint text-leaf",
  completed: "bg-leaf/15 text-leaf",
  cancelled: "bg-clay/10 text-clay",
};

export default function OrdersPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ orders: OrderRow[] }>("/api/admin/orders")
      .then((d) => setOrders(d.orders))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id: number, status: string) => {
    try {
      await api("/api/admin/orders", {
        method: "PATCH",
        body: { id, status },
      });
      setFlash("تم تحديث حالة الطلب");
      setTimeout(() => setFlash(null), 2200);
      load();
      router.refresh();
    } catch {
      /* ignore */
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-extrabold transition",
            filter === "all"
              ? "bg-navy text-white"
              : "bg-paper text-ink/55 ring-1 ring-line"
          )}
        >
          الكل ({orders.length.toLocaleString("ar-EG")})
        </button>
        {ORDER_STATUSES.map((s) => {
          const n = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-extrabold transition",
                filter === s
                  ? "bg-navy text-white"
                  : "bg-paper text-ink/55 ring-1 ring-line"
              )}
            >
              {ORDER_STATUS_LABELS[s]} ({n.toLocaleString("ar-EG")})
            </button>
          );
        })}
        {flash && (
          <span className="animate-fade-in ms-auto rounded-full bg-leaf/15 px-3 py-1.5 text-xs font-extrabold text-leaf">
            {flash}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-paper py-16 text-center ring-1 ring-line">
          <p className="font-display text-lg font-extrabold">لا توجد طلبات</p>
          <p className="mt-2 text-xs text-ink/45">
            أول طلب من الزبائن هيظهر هنا فورًا مع كل تفاصيله.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o) => {
            const open = openId === o.id;
            return (
              <li key={o.id} className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-start transition hover:bg-mint/30"
                >
                  <span className="font-mono text-xs font-black text-ink/45" dir="ltr">
                    {o.orderNo}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-extrabold">
                      {o.customerName}
                    </span>
                    <span className="text-[11px] text-ink/40">
                      {o.city} · {o.items.length.toLocaleString("ar-EG")} قطعة ·{" "}
                      {timeAgo(o.createdAt)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-extrabold",
                      statusStyles[o.status]
                    )}
                  >
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-display text-base font-black text-navy">
                    {formatPrice(o.total)}
                  </span>
                  <IconChevronDown
                    className={cn(
                      "h-4 w-4 text-ink/30 transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <div className="animate-fade-in border-t border-line bg-cream/60 px-5 py-4">
                    <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
                      <div>
                        <h4 className="mb-2 text-[11px] font-extrabold text-ink/45">
                          المحتويات
                        </h4>
                        <ul className="space-y-2">
                          {o.items.map((it) => (
                            <li key={it.id} className="flex items-center gap-3">
                              <span className="h-10 w-9 shrink-0 overflow-hidden rounded-lg bg-mint">
                                {it.image && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={it.image}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-1 block text-xs font-bold">
                                  {it.productName}
                                </span>
                                {it.options && (
                                  <span className="text-[10px] text-ink/45">
                                    {it.options}
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-ink/45">
                                ×{it.qty.toLocaleString("ar-EG")}
                              </span>
                              <span className="text-xs font-extrabold text-navy">
                                {formatPrice(it.price * it.qty)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 flex justify-between border-t border-line pt-3 text-xs">
                          <span className="text-ink/50">
                            توصيل:{" "}
                            {o.shippingFee === 0
                              ? "مجاني"
                              : formatPrice(o.shippingFee)}
                          </span>
                          <span className="font-extrabold text-navy">
                            الإجمالي: {formatPrice(o.total)}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-3">
                        {o.assignedToName && (
                      <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1.5 text-[10px] font-extrabold text-leaf">
                        استلم الطلب: {o.assignedToName}
                        {o.waNumber && <span dir="ltr">· {o.waNumber}</span>}
                      </p>
                    )}
                    <h4 className="text-[11px] font-extrabold text-ink/45">
                          بيانات التوصيل
                        </h4>
                        <p className="text-xs font-bold">{o.customerName}</p>
                        <a
                          href={`tel:${o.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-leaf hover:underline"
                          dir="ltr"
                        >
                          <IconPhone className="h-3.5 w-3.5" />
                          {o.phone}
                        </a>
                        <p className="text-xs leading-6 text-ink/55">
                          {o.city} — {o.address}
                        </p>
                        <p className="text-xs text-ink/55">
                          الدفع:{" "}
                          {o.payment === "cod"
                            ? "عند الاستلام"
                            : "بطاقة / محفظة"}
                          {o.notes && (
                            <span className="mt-1 block rounded-lg bg-gold/15 px-3 py-2 text-[11px] font-bold text-[#a8781a]">
                              ملاحظة: {o.notes}
                            </span>
                          )}
                        </p>
                        <div className="pt-1">
                          <label className="mb-1.5 block text-[11px] font-extrabold text-ink/45">
                            تحديث الحالة
                          </label>
                          <select
                            value={o.status}
                            onChange={(e) => changeStatus(o.id, e.target.value)}
                            className="input-base w-auto cursor-pointer py-2.5 text-xs font-bold"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

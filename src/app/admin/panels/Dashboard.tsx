"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  IconBox,
  IconStore,
  IconStar,
  IconTag,
} from "@/components/icons";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

interface DashData {
  revenue: number;
  ordersCount: number;
  productsCount: number;
  pendingReviews: number;
  lowStock: number;
  recentOrders: Array<{
    id: number;
    orderNo: string;
    customerName: string;
    city: string | null;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    price: number;
    images: string[];
  }>;
}

const statusStyles: Record<string, string> = {
  new: "bg-navy/10 text-navy",
  processing: "bg-gold/20 text-gold",
  shipped: "bg-mint text-leaf",
  completed: "bg-leaf/15 text-leaf",
  cancelled: "bg-clay/10 text-clay",
};

export default function DashboardPanel({
  goTo,
}: {
  goTo: (tab: string) => void;
}) {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    api<DashData>("/api/admin/dashboard")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="grid place-items-center rounded-2xl bg-paper py-20 ring-1 ring-line">
        <p className="text-sm text-ink/50">جارٍ تحميل البيانات…</p>
      </div>
    );
  }

  const stats = [
    { label: "إجمالي الإيرادات", value: formatPrice(data.revenue), icon: IconTag, tone: "bg-navy text-white" },
    { label: "الطلبات", value: data.ordersCount.toLocaleString("ar-EG"), icon: IconStore, tone: "bg-leaf text-white" },
    { label: "المنتجات", value: data.productsCount.toLocaleString("ar-EG"), icon: IconBox, tone: "bg-gold text-ink" },
    { label: "منتجات بمخزون منخفض", value: data.lowStock.toLocaleString("ar-EG"), icon: IconStar, tone: "bg-clay text-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-fade-up rounded-2xl bg-paper p-5 ring-1 ring-line transition hover:shadow-lg"
          >
            <span
              className={`inline-grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}
            >
              <s.icon className="h-5 w-5" />
            </span>
            <p className="font-display mt-4 text-2xl font-black text-ink">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-bold text-ink/45">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent orders */}
        <section className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-extrabold">
              أحدث الطلبات
            </h2>
            <button
              onClick={() => goTo("orders")}
              className="text-xs font-bold text-leaf hover:underline"
            >
              إدارة كل الطلبات ←
            </button>
          </header>
          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink/45">
              مفيش طلبات لحد كده — أول طلب هيظهر هنا فورًا.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-mint/30"
                >
                  <span className="font-mono text-xs font-bold text-ink/50" dir="ltr">
                    {o.orderNo}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-bold">
                      {o.customerName}
                    </span>
                    <span className="text-[11px] text-ink/40">
                      {o.city} · {timeAgo(o.createdAt)}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusStyles[o.status] ?? "bg-line"}`}
                  >
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <span className="font-display text-sm font-black text-navy">
                    {formatPrice(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top products */}
        <section className="overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
          <header className="border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-extrabold">
              الأكثر مبيعًا
            </h2>
          </header>
          <ul className="divide-y divide-line">
            {data.topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-display text-sm font-black text-ink/25">
                  {(i + 1).toLocaleString("ar-EG")}
                </span>
                <span className="h-10 w-9 overflow-hidden rounded-lg bg-mint">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-xs font-bold">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-ink/40">
                    {p.sales.toLocaleString("ar-EG")} عملية بيع
                  </span>
                </span>
                <span className="text-xs font-extrabold text-navy">
                  {formatPrice(p.price)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

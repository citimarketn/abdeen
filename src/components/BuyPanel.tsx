"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useI18n } from "@/lib/i18n";
import {
  IconCart,
  IconMinus,
  IconPlus,
  IconReturn,
  IconShield,
  IconTruck,
} from "./icons";
import { cn, formatPrice } from "@/lib/utils";

export default function BuyPanel({
  slug,
  name,
  price,
  oldPrice,
  image,
  sizes,
  colors,
  stock,
  currency,
}: {
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string;
  sizes: string[];
  colors: string[];
  stock: number;
  currency: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { t, locale } = useI18n();
  const en = locale === "en";
  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const out = stock <= 0;
  const low = !out && stock <= 8;

  const doAdd = (thenCheckout?: boolean) => {
    if (out) return;
    addItem({
      slug,
      name,
      price,
      oldPrice,
      image,
      size,
      color,
      stock,
      qty,
    });
    if (thenCheckout) router.push("/checkout");
  };

  const realColors = colors.filter((c) => c !== "متعدد" && c !== "شفاف");
  const realSizes = sizes.filter((s) => s !== "مقاس واحد");

  return (
    <div className="space-y-5">
      {out ? (
        <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm font-bold text-clay">
          {t("outOfStock")}
        </p>
      ) : low ? (
        <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm font-bold text-gold">
          {t("lowStock")} {stock.toLocaleString("ar-EG")} {t("lowStockEnd")}
        </p>
      ) : null}

      {realSizes.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-extrabold text-ink/60">
            {t("sizeLabel")}: <span className="text-leaf">{size}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {realSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-11 rounded-xl border-2 px-3 py-2 text-xs font-extrabold transition",
                  size === s
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-paper text-ink/60 hover:border-navy/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {realColors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-extrabold text-ink/60">
            {t("colorLabel")}: <span className="text-leaf">{color}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {realColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition",
                  color === c
                    ? "border-leaf bg-mint text-ink"
                    : "border-line bg-paper text-ink/55 hover:border-leaf/50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-2xl border-2 border-line bg-paper">
          <button
            onClick={() => setQty((v) => Math.min(v + 1, Math.max(stock, 1)))}
            aria-label="زيادة الكمية"
            className="grid h-11 w-11 place-items-center text-ink/60 transition hover:text-leaf"
          >
            <IconPlus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-display text-base font-extrabold">
            {qty.toLocaleString("ar-EG")}
          </span>
          <button
            onClick={() => setQty((v) => Math.max(v - 1, 1))}
            aria-label="إنقاص الكمية"
            className="grid h-11 w-11 place-items-center text-ink/60 transition hover:text-clay"
          >
            <IconMinus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-ink/45">
          {t("itemTotal")}: {formatPrice(price * qty, currency)}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => doAdd(false)}
          disabled={out}
          className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-leaf px-6 py-4 font-display text-sm font-bold text-white shadow-xl shadow-leaf/25 transition-all hover:-translate-y-0.5 hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconCart className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
          {t("addToCart")}
        </button>
        <button
          onClick={() => doAdd(true)}
          disabled={out}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-navy px-6 py-4 font-display text-sm font-bold text-white shadow-xl shadow-navy/25 transition-all hover:-translate-y-0.5 hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("buyNow")}
        </button>
      </div>

      <ul className="grid grid-cols-3 gap-2 pt-1">
        {[
          { icon: IconTruck, l: t("fastDel") },
          { icon: IconReturn, l: t("ret14") },
          { icon: IconShield, l: t("paySafe") },
        ].map((b) => (
          <li
            key={b.l}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-mint/60 px-2 py-3 text-center ring-1 ring-mint-deep/50"
          >
            <b.icon className="h-4.5 w-4.5 text-leaf" />
            <span className="text-[10px] font-bold text-ink/60">{b.l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

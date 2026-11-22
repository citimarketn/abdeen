"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { useI18n } from "@/lib/i18n";
import {
  IconCart,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash,
  IconTruck,
  IconArrow,
} from "./icons";
import { formatPrice } from "@/lib/utils";

interface DrawerConfig {
  freeShippingOver: number;
  shippingFee: number;
  freeShippingEnabled: boolean;
  currency: string;
  cartBg: string;
}

const DRAWER_DEFAULT: DrawerConfig = {
  freeShippingOver: 1000,
  shippingFee: 50,
  freeShippingEnabled: true,
  currency: "ج.م",
  cartBg: "",
};

export function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    drawerOpen,
    closeDrawer,
    removeItem,
    setQty,
  } = useCart();
  const [cfg, setCfg] = useState<DrawerConfig>(DRAWER_DEFAULT);
  const { t, locale } = useI18n();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        setCfg({
          freeShippingOver: s.freeShippingOver,
          shippingFee: s.shippingFee,
          freeShippingEnabled: s.freeShippingEnabled,
          currency: s.currency,
          cartBg: s.cartBg ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const freeShipTarget = cfg.freeShippingOver;
  const progress = Math.min(subtotal / freeShipTarget, 1);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-[70] bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel (slides from the inline-end: left in RTL, right in LTR) */}
      <aside
        role="dialog"
        aria-label={t("cart")}
        className={`fixed inset-y-0 z-[80] flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          locale === "ar" ? "left-0" : "right-0"
        } ${
          drawerOpen
            ? "translate-x-0"
            : locale === "ar"
              ? "-translate-x-full"
              : "translate-x-full"
        }`}
      >
        {cfg.cartBg && (
          <div className="pointer-events-none absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cfg.cartBg}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-cream/92" />
          </div>
        )}
        <header className="relative flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <h2 className="font-display flex items-center gap-2 text-lg font-bold">
            <IconCart className="h-5 w-5 text-leaf" />
            {t("cart")}
            {count > 0 && (
              <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-bold text-leaf">
                {count.toLocaleString("ar-EG")} {t("itemsWord")}
              </span>
            )}
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="إغلاق السلة"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper transition hover:rotate-90 hover:border-ink/30"
          >
            <IconClose className="h-4.5 w-4.5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-mint">
              <IconCart className="h-10 w-10 text-leaf" />
            </div>
            <p className="font-display text-xl font-bold">{t("cartEmpty")}</p>
            <p className="text-sm text-ink/55">{t("cartEmptyDesc")}</p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-deep"
            >
              {t("browse")}
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="relative border-b border-line bg-mint/60 px-5 py-3">
              {cfg.freeShippingEnabled ? (
                <>
                  <p className="flex items-center gap-2 text-xs font-medium text-ink/75">
                    <IconTruck className="h-4 w-4 text-leaf" />
                    {progress >= 1
                      ? t("shipLocked")
                      : `${t("shipAdd")} ${formatPrice(Math.max(freeShipTarget - subtotal, 0), cfg.currency)} ${t("shipForFree")}`}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-leaf transition-all duration-500"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="flex items-center gap-2 text-xs font-medium text-ink/75">
                  <IconTruck className="h-4 w-4 text-leaf" />
                  {formatPrice(cfg.shippingFee, cfg.currency)} — {t("shipFeeNote")}
                </p>
              )}
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3.5 py-4">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeDrawer}
                    className="block h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-paper ring-1 ring-line"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeDrawer}
                      className="line-clamp-1 text-sm font-bold hover:text-leaf"
                    >
                      {item.name}
                    </Link>
                    {(item.size || item.color) && (
                      <p className="mt-0.5 text-[11px] text-ink/50">
                        {[
                          item.size && item.size !== "مقاس واحد" ? item.size : null,
                          item.color && item.color !== "متعدد" ? item.color : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-line bg-paper">
                        <button
                          onClick={() => setQty(item.key, item.qty + 1)}
                          aria-label="زيادة الكمية"
                          className="grid h-7 w-7 place-items-center text-ink/60 transition hover:text-leaf"
                        >
                          <IconPlus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">
                          {item.qty.toLocaleString("ar-EG")}
                        </span>
                        <button
                          onClick={() => setQty(item.key, item.qty - 1)}
                          aria-label="إنقاص الكمية"
                          className="grid h-7 w-7 place-items-center text-ink/60 transition hover:text-clay"
                        >
                          <IconMinus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-bold text-navy">
                        {formatPrice(item.price * item.qty, cfg.currency)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label="حذف من السلة"
                    className="self-start rounded-lg p-1.5 text-ink/30 transition hover:bg-clay/10 hover:text-clay"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="relative space-y-3 border-t border-line bg-paper px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/60">{t("subtotal")}</span>
                <span className="font-display text-xl font-extrabold text-navy">
                  {formatPrice(subtotal, cfg.currency)}
                </span>
              </div>
              <p className="text-[11px] leading-5 text-ink/45">
                {cfg.freeShippingEnabled
                  ? `${t("feeCalcNote")} ${formatPrice(freeShipTarget, cfg.currency)}.`
                  : t("feeFixedNote")}
              </p>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-leaf py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-leaf/25 transition hover:bg-leaf/90"
              >
                {t("checkout")}
                <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
              <button
                onClick={closeDrawer}
                className="w-full text-center text-xs font-medium text-ink/50 underline-offset-4 hover:underline"
              >
                {t("keepShopping")}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

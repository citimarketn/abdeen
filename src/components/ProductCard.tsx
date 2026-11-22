"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import RatingStars from "./RatingStars";
import { IconCart } from "./icons";
import { useI18n } from "@/lib/i18n";
import { cn, discountPct, formatPrice } from "@/lib/utils";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  badge: string | null;
  stock: number;
  avgRating: number | null;
  ratingCount: number;
  categorySlug: string;
}

export default function ProductCard({
  product,
  categoryName,
  currency = "ج.م",
}: {
  product: ProductCardData;
  categoryName?: string;
  currency?: string;
}) {
  const { addItem } = useCart();
  const { t } = useI18n();
  const pct = discountPct(product.price, product.oldPrice);
  const out = product.stock <= 0;

  const quickAdd = () => {
    if (out) return;
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.images[0] ?? "",
      size: product.sizes[0],
      color: product.colors[0],
      stock: product.stock,
    });
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-line transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10 hover:ring-leaf/40">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-mint"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]",
            out && "opacity-50 saturate-50"
          )}
        />
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {pct > 0 && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg">
              -{pct.toLocaleString("ar-EG")}٪
            </span>
          )}
          {product.badge && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-lg",
                product.badge === "جديد"
                  ? "bg-leaf-bright text-ink"
                  : "bg-navy text-white"
              )}
            >
              {product.badge}
            </span>
          )}
        </div>
        {out && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-xs font-bold text-white">
            {t("soldOut")}
          </span>
        )}
        {!out && (
          <button
            onClick={quickAdd}
            aria-label="إضافة سريعة إلى السلة"
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 translate-y-14 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-leaf max-sm:translate-y-0 max-sm:opacity-100"
          >
            <IconCart className="h-4 w-4" />
            {t("quickAdd")}
          </button>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {categoryName && (
          <p className="text-[11px] font-medium text-ink/45">{categoryName}</p>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-1 font-display text-[15px] font-bold text-ink transition group-hover:text-navy"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <RatingStars value={product.avgRating} size="xs" />
          <span className="text-[11px] text-ink/40">
            ({product.ratingCount.toLocaleString("ar-EG")})
          </span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <span className="font-display text-lg font-extrabold text-navy">
            {formatPrice(product.price, currency)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-ink/35 line-through">
              {formatPrice(product.oldPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { IconClose } from "./icons";
import { cn } from "@/lib/utils";

interface CategoryLite {
  name: string;
  slug: string;
}

export default function FilterBar({
  categories,
}: {
  categories: CategoryLite[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { t } = useI18n();

  const cat = params.get("cat") ?? "";
  const sort = params.get("sort") ?? "";
  const price = params.get("price") ?? "";
  const rating = params.get("rating") ?? "";
  const sale = params.get("sale") === "1";
  const stock = params.get("stock") === "1";

  const activeCount =
    (cat ? 1 : 0) +
    (price ? 1 : 0) +
    (rating ? 1 : 0) +
    (sale ? 1 : 0) +
    (stock ? 1 : 0);

  const set = (key: string, value: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (value == null || value === "") p.delete(key);
    else p.set(key, value);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const priceRanges = [
    { v: "", l: t("priceAny") },
    { v: "0-400", l: t("price1") },
    { v: "400-900", l: t("price2") },
    { v: "900-1500", l: t("price3") },
    { v: "1500-99999", l: t("price4") },
  ];
  const sorts = [
    { v: "", l: t("sortNewest") },
    { v: "best", l: t("sortSales") },
    { v: "price-asc", l: t("sortPriceAsc") },
    { v: "price-desc", l: t("sortPriceDesc") },
    { v: "rating", l: t("sortRating") },
  ];

  return (
    <div className="rounded-2xl bg-paper p-4 ring-1 ring-line sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-extrabold text-ink">
          {t("filterTitle")}
          {activeCount > 0 && (
            <span className="ms-2 rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-leaf">
              {activeCount.toLocaleString("ar-EG")} {t("filtersCount")}
            </span>
          )}
        </span>

        <div className="ms-auto flex flex-wrap items-center gap-2.5">
          <select
            value={price}
            onChange={(e) => set("price", e.target.value)}
            className="input-base w-auto cursor-pointer appearance-none bg-paper py-2.5 text-xs font-bold"
            aria-label="price"
          >
            {priceRanges.map((r) => (
              <option key={r.v} value={r.v}>
                {r.l}
              </option>
            ))}
          </select>

          <select
            value={rating}
            onChange={(e) => set("rating", e.target.value)}
            className="input-base w-auto cursor-pointer appearance-none bg-paper py-2.5 text-xs font-bold"
            aria-label="rating"
          >
            <option value="">{t("ratingAny")}</option>
            <option value="4">{t("rating4")}</option>
            <option value="3">{t("rating3")}</option>
          </select>

          <select
            value={sort}
            onChange={(e) => set("sort", e.target.value)}
            className="input-base relative w-auto cursor-pointer appearance-none bg-paper py-2.5 text-xs font-bold"
            aria-label="sort"
          >
            {sorts.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>

          <button
            onClick={() => set("sale", sale ? null : "1")}
            className={cn(
              "rounded-xl border-2 px-4 py-2.5 text-xs font-extrabold transition",
              sale
                ? "border-clay bg-clay text-white"
                : "border-line bg-paper text-ink/60 hover:border-clay/50 hover:text-clay"
            )}
          >
            {t("onlyDeals")}
          </button>
          <button
            onClick={() => set("stock", stock ? null : "1")}
            className={cn(
              "rounded-xl border-2 px-4 py-2.5 text-xs font-extrabold transition",
              stock
                ? "border-leaf bg-leaf text-white"
                : "border-line bg-paper text-ink/60 hover:border-leaf/60 hover:text-leaf"
            )}
          >
            {t("onlyStock")}
          </button>

          {activeCount > 0 && (
            <button
              onClick={() =>
                router.replace(
                  params.get("q") ? `?q=${params.get("q")}` : "/",
                  { scroll: false }
                )
              }
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold text-ink/50 hover:text-clay"
            >
              <IconClose className="h-3.5 w-3.5" />
              {t("clearFilters")}
            </button>
          )}
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto border-t border-line pt-4">
        <button
          onClick={() => set("cat", null)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition",
            !cat
              ? "bg-navy text-white shadow-md shadow-navy/25"
              : "bg-cream text-ink/60 ring-1 ring-line hover:text-navy"
          )}
        >
          {t("allCats")}
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => set("cat", c.slug)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition",
              cat === c.slug
                ? "bg-navy text-white shadow-md shadow-navy/25"
                : "bg-cream text-ink/60 ring-1 ring-line hover:text-navy"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

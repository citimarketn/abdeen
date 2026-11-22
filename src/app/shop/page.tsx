import { Suspense } from "react";
import Link from "next/link";
import StoreShell from "@/components/StoreShell";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { IconSearch } from "@/components/icons";
import {
  getCategories,
  getSettings,
  queryProducts,
} from "@/lib/store";
import { cn, motionClass } from "@/lib/utils";
import { T } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const str = (k: string) =>
    typeof sp[k] === "string" && (sp[k] as string) ? (sp[k] as string) : undefined;

  const q = str("q");
  const cat = str("cat");
  const sort = str("sort");
  const sale = str("sale") === "1";
  const fresh = str("fresh") === "1";
  const best = str("best") === "1";
  const price = str("price");
  const [priceMin, priceMax] = price
    ? price.split("-").map(Number)
    : [undefined, undefined];
  const minRating = str("rating") ? Number(str("rating")) : undefined;
  const inStock = str("stock") === "1";

  const [products, categories, settings] = await Promise.all([
    queryProducts({
      q,
      cat,
      sort,
      sale,
      fresh,
      best,
      priceMin,
      priceMax,
      minRating,
      inStock,
    }),
    getCategories(),
    getSettings(),
  ]);

  const catName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name;

  const title = q
    ? `نتائج البحث عن «${q}»`
    : fresh
      ? "وصل حديثًا"
      : sale
        ? "العروض والخصومات"
        : best
          ? "الأكثر مبيعًا"
          : cat
            ? categories.find((c) => c.slug === cat)?.name ?? "المنتجات"
            : "كل المنتجات";

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        {/* Header band with optional background */}
        <div className="relative overflow-hidden rounded-3xl">
          {settings.shopBg && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.shopBg}
                alt=""
                className={cn(
                  "absolute inset-0 h-full w-full object-cover opacity-45",
                  motionClass(settings.shopBgMotion)
                )}
              />
              <div className="absolute inset-0 bg-cream/80" />
            </>
          )}
          <div className="relative px-5 py-7 sm:px-7">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-ink/45">
              <Link href="/" className="hover:text-leaf">
                <T k="home" />
              </Link>
              <span>/</span>
              <span className="font-bold text-ink/70">
                <T k="storeName" />
              </span>
              <span>/</span>
              <span className="font-bold text-leaf">{title}</span>
            </nav>

            <h1 className="font-display text-3xl font-black text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink/55">
              {products.length.toLocaleString("ar-EG")}{" "}
              <T k="productsCount" />
              {best && <T k="sortBest" />}
              {fresh && <T k="sortFresh" />}
              {sale && <T k="sortSale" />}
            </p>
          </div>
        </div>

        <div className="mb-7 mt-6">
          <Suspense>
            <FilterBar
              categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
            />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-mint">
              <IconSearch className="h-10 w-10 text-leaf" />
            </span>
            <h2 className="font-display text-xl font-black">
              <T k="noResults" />
            </h2>
            <p className="max-w-sm text-sm text-ink/55">
              <T k="noResultsDesc" />
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy-deep"
            >
              <T k="allProducts" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 70}>
                <ProductCard
                  product={p}
                  categoryName={catName(p.categorySlug)}
                  currency={settings.currency}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}

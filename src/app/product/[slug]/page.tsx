import Link from "next/link";
import { notFound } from "next/navigation";
import StoreShell from "@/components/StoreShell";
import ProductGallery from "@/components/ProductGallery";
import BuyPanel from "@/components/BuyPanel";
import ReviewForm from "@/components/ReviewForm";
import ProductCard from "@/components/ProductCard";
import RatingStars from "@/components/RatingStars";
import Reveal from "@/components/Reveal";
import { IconCheck, IconBox, IconTag, IconTruck, IconVideo } from "@/components/icons";
import { T } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  getCategories,
  getProductWithReviews,
  getSettings,
} from "@/lib/store";
import { discountPct, formatPrice, timeAgo, ytEmbedId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductWithReviews(slug);
  if (!data || !data.product) notFound();
  const { product, category, reviewsList, related } = data;
  const settings = await getSettings();
  const categories = await getCategories();

  const pct = discountPct(product.price, product.oldPrice);
  const avg = reviewsList.length
    ? reviewsList.reduce((s, r) => s + r.rating, 0) / reviewsList.length
    : null;
  const relatedList = related.filter((r) => r.slug !== product.slug).slice(0, 4);
  const catName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name;

  const specs: Array<{ label: React.ReactNode; value: React.ReactNode }> = [
    { label: <T k="category" />, value: category?.name ?? "—" },
    {
      label: <T k="sizesLabel" />,
      value: product.sizes.length ? product.sizes.join(", ") : "—",
    },
    {
      label: <T k="colorsLabel" />,
      value: product.colors.length ? product.colors.join(", ") : "—",
    },
    {
      label: <T k="statusLabel" />,
      value:
        product.stock > 0 ? <T k="inStockT" /> : <T k="outStockT" />,
    },
  ];
  if (product.deliveryDays != null && product.deliveryDays > 0) {
    specs.push({
      label: <T k="deliveryEta" />,
      value: (
        <>
          {product.deliveryDays} <T k="daysWord" />
        </>
      ),
    });
  }
  const ytId = product.videoUrl ? ytEmbedId(product.videoUrl) : null;

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-ink/45">
          <Link href="/" className="hover:text-leaf">
            <T k="home" />
          </Link>
          <span>/</span>
          <Link
            href={`/shop?cat=${product.categorySlug}`}
            className="hover:text-leaf"
          >
            {category?.name}
          </Link>
          <span>/</span>
          <span className="max-w-52 truncate font-bold text-leaf">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <ProductGallery
              images={product.images}
              name={product.name}
              badge={product.badge}
              pct={pct}
            />
          </Reveal>

          <Reveal delay={120}>
            <div>
              <Link
                href={`/shop?cat=${product.categorySlug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3.5 py-1.5 text-[11px] font-extrabold text-leaf transition hover:bg-mint-deep"
              >
                <IconTag className="h-3 w-3" />
                {category?.name}
              </Link>

              <h1 className="font-display mt-4 text-2xl font-black leading-snug text-ink sm:text-3xl">
                {product.name}
              </h1>

              <p
                className={cn(
                  "mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold ring-1",
                  product.source === "dropship"
                    ? "bg-gold/10 text-gold ring-gold/30"
                    : "bg-mint text-leaf ring-leaf/25"
                )}
              >
                {product.source === "dropship" ? (
                  <IconTruck className="h-3.5 w-3.5" />
                ) : (
                  <IconBox className="h-3.5 w-3.5" />
                )}
                <T k={product.source === "dropship" ? "srcPartner" : "srcOurs"} />
              </p>

              <a
                href="#reviews"
                className="mt-3 inline-flex items-center gap-2"
              >
                <RatingStars value={avg} />
                <span className="text-xs text-ink/50">
                  {avg
                    ? `${avg.toFixed(1).replace(".0", "")} <T k="of5" /> · `
                    : ""}
                  {reviewsList.length.toLocaleString("ar-EG")} <T k="reviews" />
                </span>
              </a>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="font-display text-4xl font-black text-navy">
                  {formatPrice(product.price, settings.currency)}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-lg text-ink/35 line-through">
                      {formatPrice(product.oldPrice, settings.currency)}
                    </span>
                    <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-extrabold text-clay">
                      <T k="youSave" /> {formatPrice(product.oldPrice - product.price, settings.currency)}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-ink/40">
                {settings.paymentNote}
              </p>

              <div className="mt-7">
                <BuyPanel
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.images[0] ?? ""}
                  sizes={product.sizes}
                  colors={product.colors}
                  stock={product.stock}
                  currency={settings.currency}
                />
              </div>

              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {specs.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 ring-1 ring-line"
                  >
                    <span className="text-xs font-bold text-ink/45">{s.label}</span>
                    <span className="text-xs font-extrabold text-ink">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Description */}
        <Reveal className="mt-16">
          <section className="rounded-3xl bg-paper p-7 ring-1 ring-line sm:p-10">
            <h2 className="font-display flex items-center gap-2.5 text-xl font-black">
              <IconBox className="h-5 w-5 text-leaf" />
              <T k="descTitle" />
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-8 text-ink/70">
              {product.description}
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
              {["dPoint1", "dPoint2", "dPoint3"].map(
                (t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 rounded-xl bg-mint/60 px-4 py-3 text-xs font-bold text-ink/70"
                  >
                    <IconCheck className="h-4 w-4 shrink-0 text-leaf" />
                    <T k={t} />
                  </li>
                )
              )}
            </ul>
          </section>
        </Reveal>

        {/* Product video */}
        {ytId && (
          <Reveal className="mt-10">
            <section className="overflow-hidden rounded-3xl bg-paper p-7 ring-1 ring-line sm:p-10">
              <h2 className="font-display flex items-center gap-2.5 text-xl font-black">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-clay/10 text-clay">
                  <IconVideo className="h-4.5 w-4.5" />
                </span>
                <T k="videoTitle" />
              </h2>
              <p className="mt-1.5 text-xs text-ink/45">
                <T k="videoSub" /> «{product.name}» <T k="videoEnd" />
              </p>
              <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-ink shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={product.name}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          </Reveal>
        )}

        {/* Reviews */}
        <section id="reviews" className="mt-14 scroll-mt-28">
          <Reveal className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-black sm:text-3xl">
              <T k="reviewsTitle" />{" "}
              <span className="text-base font-bold text-ink/40">
                ({reviewsList.length.toLocaleString("ar-EG")})
              </span>
            </h2>
            {avg != null && (
              <div className="flex items-center gap-3 rounded-2xl bg-paper px-5 py-3 ring-1 ring-line">
                <span className="font-display text-2xl font-black text-navy">
                  {avg.toFixed(1).replace(".0", "")}
                </span>
                <span>
                  <RatingStars value={avg} size="xs" />
                  <span className="mt-0.5 block text-[10px] text-ink/45">
                    <T k="avgRating" />
                  </span>
                </span>
              </div>
            )}
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              {reviewsList.length === 0 && (
                <p className="rounded-2xl bg-paper px-6 py-8 text-center text-sm text-ink/50 ring-1 ring-line">
                  مفيش تقييمات لحد كده — كن أول من يشارك تجربته!
                </p>
              )}
              {reviewsList.map((r) => (
                <Reveal key={r.id}>
                  <article className="rounded-2xl bg-paper p-5 ring-1 ring-line transition hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-sm font-black text-white">
                          {r.name.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-sm font-extrabold">
                            {r.name}
                          </span>
                          <span className="text-[11px] text-ink/40">
                            {timeAgo(r.createdAt)} · <T k="verifiedBuy" />
                          </span>
                        </span>
                      </div>
                      <RatingStars value={r.rating} size="xs" />
                    </div>
                    {r.title && (
                      <h3 className="mt-3.5 text-sm font-extrabold">
                        {r.title}
                      </h3>
                    )}
                    <p className="mt-1.5 text-sm leading-7 text-ink/65">
                      {r.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100}>
              <ReviewForm
                productSlug={product.slug}
                productName={product.name}
              />
            </Reveal>
          </div>
        </section>

        {/* Related */}
        {relatedList.length > 0 && (
          <section className="mt-16">
            <Reveal className="mb-7">
              <h2 className="font-display text-2xl font-black sm:text-3xl">
                <T k="related" />
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedList.map((p, i) => (
                <Reveal key={p.id} delay={i * 90}>
                  <ProductCard
                    product={p}
                    categoryName={catName(p.categorySlug)}
                    currency={settings.currency}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreShell>
  );
}

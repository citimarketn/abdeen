import Link from "next/link";
import StoreShell from "@/components/StoreShell";
import HomeHero from "@/components/HomeHero";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import Faq from "@/components/Faq";
import RatingStars from "@/components/RatingStars";
import { T } from "@/lib/i18n";
import {
  IconArrow,
  IconChat,
  IconGift,
  IconReturn,
  IconShield,
  IconStar,
  IconTruck,
} from "@/components/icons";
import {
  getCategories,
  getSettings,
  getTestimonials,
  queryProducts,
} from "@/lib/store";
import { discountPct } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FALLBACK_IMG =
  "https://images.pexels.com/photos/32178223/pexels-photo-32178223.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=900&h=1125&fit=crop";

export default async function HomePage() {
  const [settings, categories, fresh, deals, best, testimonials] =
    await Promise.all([
      getSettings(),
      getCategories(),
      queryProducts({ fresh: true, limit: 8 }),
      queryProducts({ sale: true, limit: 8 }),
      queryProducts({ best: true, limit: 8 }),
      getTestimonials(),
    ]);

  const sortedDeals = [...deals].sort(
    (a, b) => discountPct(b.price, b.oldPrice) - discountPct(a.price, a.oldPrice)
  );
  const catName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name;

  const collections = [
    {
      key: "colNewTitle",
      desc: "colNewDesc",
      img: fresh[0]?.images[0] ?? FALLBACK_IMG,
      href: "/shop?fresh=1",
      accent: "bg-leaf",
    },
    {
      key: "colDealsTitle",
      desc: "colDealsDesc",
      img: sortedDeals[0]?.images[0] ?? FALLBACK_IMG,
      href: "/shop?sale=1",
      accent: "bg-clay",
    },
    {
      key: "colBestTitle",
      desc: "colBestDesc",
      img: best[0]?.images[0] ?? FALLBACK_IMG,
      href: "/shop?best=1",
      accent: "bg-navy",
    },
  ];

  const values = [
    { icon: IconTruck, t: "val1t", d: "val1d" },
    { icon: IconReturn, t: "val2t", d: "val2d" },
    { icon: IconShield, t: "val3t", d: "val3d" },
    { icon: IconChat, t: "val4t", d: "val4d" },
  ];

  return (
    <StoreShell>
      <HomeHero settings={settings} />

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <Reveal>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="group w-28 shrink-0 text-center sm:w-auto"
              >
                <span className="relative mx-auto block h-20 w-20 overflow-hidden rounded-full ring-2 ring-line transition-all duration-300 group-hover:ring-leaf group-hover:ring-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image ?? FALLBACK_IMG}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="mt-2.5 line-clamp-1 text-xs font-bold text-ink/70 transition group-hover:text-leaf">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ FEATURED COLLECTIONS ============ */}
      {settings.showCollections && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-leaf">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                <T k="featured" />
              </p>
              <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-4xl">
                <T k="pickFavor" />
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-leaf"
            >
              <T k="viewAll" />
              <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {collections.map((col, i) => (
              <Reveal key={col.key} delay={i * 120}>
                <Link
                  href={col.href}
                  className="group relative block overflow-hidden rounded-3xl shadow-lg shadow-ink/5"
                >
                  <div className="relative h-80 overflow-hidden sm:h-96">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={col.img}
                      alt={col.key}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span
                        className={`mb-3 inline-block rounded-full ${col.accent} px-3 py-1 text-[10px] font-extrabold text-white`}
                      >
                        <T k="collectionChosen" />
                      </span>
                      <h3 className="font-display text-2xl font-black text-white">
                        <T k={col.key} />
                      </h3>
                      <p className="mt-1 text-xs text-white/70">
                        <T k={col.desc} />
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-leaf-bright">
                        <T k="explore" />
                        <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ DEALS ============ */}
      {settings.showDeals && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-clay">
                <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                <T k="dealsPeriod" />
              </p>
              <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-4xl">
                <T k="dealsTitle" />
              </h2>
            </div>
            <Link
              href="/shop?sale=1"
              className="group inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-leaf"
            >
              <T k="viewAllDeals" />
              <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {sortedDeals.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 90}>
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

      {/* ============ VALUES ============ */}
      {settings.showValues && (
        <section className="relative mt-20 overflow-hidden bg-navy-deep py-14">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 100} className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf/15 text-leaf-bright ring-1 ring-leaf/25">
                  <v.icon className="h-5.5 w-5.5" />
                </span>
                <span>
                  <span className="font-display block text-base font-extrabold text-white">
                    <T k={v.t} />
                  </span>
                  <span className="mt-1 block text-xs leading-6 text-white/55">
                    <T k={v.d} />
                  </span>
                </span>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ BESTSELLERS ============ */}
      {settings.showBest && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                <T k="bestPick" />
              </p>
              <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-4xl">
                <T k="bestTitle" />
              </h2>
            </div>
            <Link
              href="/shop?best=1"
              className="group inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-leaf"
            >
              <T k="viewAllShort" />
              <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {best.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 90}>
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

      {/* ============ TESTIMONIALS ============ */}
      {settings.showTestimonials && (
        <section className="relative mt-20 overflow-hidden bg-mint/50 py-20">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-7xl px-6">
            <Reveal className="mx-auto mb-12 max-w-xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-xs font-extrabold text-leaf ring-1 ring-leaf/20">
                <IconStar className="h-3.5 w-3.5" />
                <T k="tBadge" />
              </span>
              <h2 className="font-display mt-4 text-3xl font-black text-ink sm:text-4xl">
                <T k="tTitle1" />{" "}
                <span className="text-leaf">
                  <T k="tTitle2" />
                </span>{" "}
                <T k="tTitle3" />
              </h2>
              <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-paper px-5 py-2.5 shadow-sm ring-1 ring-line">
                <RatingStars value={4.6} />
                <span className="font-display text-sm font-extrabold text-navy">
                  4.6/5
                </span>
                <span className="text-xs text-ink/45">
                  <T k="basedOn" />
                </span>
              </div>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((t2, i) => (
                <Reveal key={t2.review.id} delay={i * 100}>
                  <figure className="flex h-full flex-col rounded-2xl bg-paper p-6 shadow-sm ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <RatingStars value={t2.review.rating} size="xs" />
                    <blockquote className="mt-3 flex-1 text-sm leading-7 text-ink/70">
                      «{t2.review.body}»
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-base font-black text-white">
                        {t2.review.name.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold">
                          {t2.review.name}
                        </span>
                        <Link
                          href={`/product/${t2.productSlug}`}
                          className="line-clamp-1 text-[11px] text-leaf hover:underline"
                        >
                          {t2.productName}
                        </Link>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ GIFT BANNER ============ */}
      {settings.showBanner && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <Reveal>
            <div className="grain relative overflow-hidden rounded-[2.5rem] bg-navy-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.bannerImage || "/images/banner.jpg"}
                alt={settings.bannerTitle}
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-navy-deep/80 via-navy-deep/40 to-transparent" />
              <div className="relative px-8 py-16 sm:px-14 sm:py-20">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-extrabold text-leaf-bright ring-1 ring-white/20">
                  <IconGift className="h-3.5 w-3.5" />
                  <T k="offerBadge" />
                </span>
                <h2 className="font-display mt-4 max-w-lg text-3xl font-black leading-snug text-white sm:text-4xl">
                  {settings.bannerTitle}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                  {settings.bannerSubtitle}
                </p>
                <Link
                  href={settings.bannerLink || "/shop"}
                  className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-leaf-bright px-8 py-4 font-display text-sm font-black text-ink shadow-2xl shadow-leaf-bright/30 transition-all hover:-translate-y-0.5 hover:bg-paper"
                >
                  {settings.bannerCta}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ============ FAQ ============ */}
      {settings.showFaq && (
        <section id="faq" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-20 sm:px-6">
          <Reveal className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-xs font-extrabold text-navy ring-1 ring-line">
              <IconChat className="h-3.5 w-3.5" />
              <T k="faqBadge" />
            </span>
            <h2 className="font-display mt-4 text-3xl font-black text-ink sm:text-4xl">
              <T k="faqTitle" />
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Faq />
          </Reveal>
        </section>
      )}
    </StoreShell>
  );
}

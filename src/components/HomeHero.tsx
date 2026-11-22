"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { IconArrow, IconSparkle, IconTruck } from "./icons";
import RatingStars from "./RatingStars";
import { cn, formatPrice, motionClass } from "@/lib/utils";
import type { StoreSettings } from "@/lib/store";

export default function HomeHero({ settings }: { settings: StoreSettings }) {
  const { t, locale } = useI18n();
  const en = locale === "en";

  const kicker = en ? t("heroKickerEn") : settings.heroKicker;
  const title = en ? t("heroTitleEn") : settings.heroTitle;
  const sub = en ? t("heroSubEn") : settings.heroSubtitle;
  const cta = en ? t("ctaShop") : settings.heroCta;
  const cta2 = en ? t("ctaDeals") : settings.heroCtaSecondary;

  return (
    <section className="relative overflow-hidden">
      {settings.heroBg && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.heroBg}
            alt=""
            className={cn("h-full w-full object-cover opacity-30", motionClass(settings.heroBgMotion))}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/60 via-cream/40 to-cream" />
        </div>
      )}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-mint-deep/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
        {/* Text */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-mint px-4 py-1.5 text-xs font-bold text-leaf">
            <IconSparkle className="h-3.5 w-3.5" />
            {kicker}
          </span>
          <h1 className="font-display mt-5 text-4xl font-black leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
            {!en && settings.heroTitle.includes("كأّنت") ? (
              settings.heroTitle.split("كأّنت").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="relative mx-1 inline-block text-leaf">
                      كأّنت
                      <svg
                        className="absolute -bottom-2 right-0 w-full text-leaf/40"
                        viewBox="0 0 120 12"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path d="M2 9C30 3 90 3 118 7" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </span>
              ))
            ) : (
              title
            )}
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-8 text-ink/60">{sub}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2.5 rounded-full bg-leaf px-8 py-4 font-display text-sm font-bold text-white shadow-xl shadow-leaf/30 transition-all hover:-translate-y-0.5 hover:bg-leaf/90 hover:shadow-2xl"
            >
              {cta}
              <IconArrow className={cn("h-4 w-4 transition-transform group-hover:-translate-x-1", en && "-scale-x-100 group-hover:translate-x-1")} />
            </Link>
            <Link
              href="/shop?sale=1"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-paper/70 px-7 py-[14px] font-display text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-clay hover:text-clay"
            >
              {cta2}
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 divide-x divide-x-reverse divide-line">
            {[
              { v: settings.heroStat1, l: t("statHappy") },
              { v: settings.heroStat2, l: t("statRating") },
              { v: settings.heroStat3, l: t("statGov") },
            ].map((s) => (
              <div key={s.l} className="px-4 first:pr-0 last:pl-0">
                <dt className="font-display text-2xl font-black text-navy">{s.v}</dt>
                <dd className="mt-1 text-[11px] font-medium text-ink/50">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative">
            <div className="absolute -inset-3 rounded-t-[220px] rounded-b-[2.5rem] bg-mint-deep/60" />
              <div className="grain relative overflow-hidden rounded-t-[220px] rounded-b-[2.5rem] shadow-2xl shadow-navy/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.heroImage || "/images/hero.jpg"}
                  alt="Abdeen collection"
                  className="aspect-[4/5] w-full object-cover"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/25 via-transparent to-transparent" />
            </div>

            <div className="animate-float absolute -right-4 top-16 flex items-center gap-2.5 rounded-2xl bg-paper/95 px-4 py-3 shadow-xl ring-1 ring-line backdrop-blur sm:-right-8">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-leaf">
                <IconTruck className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-xs font-extrabold">
                  {settings.freeShippingEnabled ? t("freeShip") : t("fastDelivery")}
                </span>
                <span className="block text-[10px] text-ink/50">
                  {settings.freeShippingEnabled
                    ? `${t("freeShipOver")} ${formatPrice(settings.freeShippingOver, settings.currency)}`
                    : t("in2to4")}
                </span>
              </span>
            </div>

            <div className="animate-float-slow absolute -left-3 bottom-14 flex items-center gap-2.5 rounded-2xl bg-paper/95 px-4 py-3 shadow-xl ring-1 ring-line backdrop-blur sm:-left-8">
              <RatingStars value={4.6} size="xs" />
              <span className="text-[11px] font-bold text-ink/70">
                4.6 {t("ratingOf")}
              </span>
            </div>

            {settings.heroBadge && (
              <div className="animate-float absolute -top-2 left-6 grid h-20 w-20 -rotate-12 place-items-center rounded-full bg-clay text-white shadow-2xl">
                <span className="text-center leading-tight">
                  <span className="font-display block text-lg font-black" dir="ltr">
                    {settings.heroBadge}
                  </span>
                  <span className="text-[9px] font-bold">{t("limitedTime")}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

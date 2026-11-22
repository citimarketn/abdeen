"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAccount } from "./AccountProvider";
import { useI18n } from "@/lib/i18n";
import { IconCart, IconSearch, IconUser, IconGear, IconSparkle } from "./icons";
import ThemeToggle from "./ThemeToggle";
import AccountModal from "./AccountModal";
import type { StoreSettings } from "@/lib/store";
import { getToken } from "@/lib/api";

interface CategoryLite {
  name: string;
  slug: string;
}

export default function Header({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: CategoryLite[];
}) {
  const { t, locale, setLocale } = useI18n();
  const { count, openDrawer, isHydrated } = useCart();
  const { customer } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [adminOk, setAdminOk] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setAdminOk(Boolean(getToken()));
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement ticker */}
      <div className="overflow-hidden bg-navy-deep py-1.5 text-white">
        <div dir="ltr" className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} dir={locale === "ar" ? "rtl" : "ltr"} className="flex shrink-0 items-center">
              {settings.ticker.map((txt, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center gap-2 whitespace-nowrap px-6 text-[12px] font-medium tracking-wide"
                >
                  <IconSparkle className="h-3 w-3 text-leaf-bright" />
                  {txt}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-line bg-paper/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Abdeen"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-mint transition-transform duration-300 group-hover:rotate-6 sm:h-12 sm:w-12"
            />
            <span className="leading-none">
              <span className="font-display block text-2xl font-extrabold tracking-tight text-navy dark:text-leaf-bright">
                {settings.storeName}
              </span>
              <span className="block text-[9px] font-bold tracking-[0.35em] text-leaf">
                {settings.storeTagline}
              </span>
            </span>
          </Link>

          <form onSubmit={submitSearch} className="relative hidden flex-1 md:block" role="search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder={t("searchPh")}
              className="input-base rounded-full border-2 border-line py-2.5 pl-12"
            />
            <button
              type="submit"
              aria-label="search"
              className="absolute left-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-navy text-white transition hover:bg-leaf"
            >
              <IconSearch className="h-4 w-4" />
            </button>
          </form>

          <div className="mr-auto flex items-center gap-2 sm:gap-2.5">
            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              aria-label="Language"
              className="h-10 rounded-full border border-line bg-paper px-3.5 text-xs font-black text-ink/60 transition hover:border-leaf hover:text-leaf"
            >
              {locale === "ar" ? "EN" : "ع"}
            </button>

            <ThemeToggle />

            {/* Account */}
            {customer ? (
              <Link
                href="/account"
                aria-label={t("myAccount")}
                title={t("myAccount")}
                className="group flex h-10 items-center gap-2 rounded-full border border-leaf/40 bg-mint px-3.5 transition hover:border-leaf"
              >
                <IconUser className="h-4.5 w-4.5 text-leaf" />
                <span className="hidden max-w-24 truncate text-xs font-extrabold text-ink/70 lg:block">
                  {customer.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setAccountOpen(true)}
                aria-label={t("account")}
                title={t("account")}
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-ink/60 transition hover:border-leaf hover:text-leaf"
              >
                <IconUser className="h-5 w-5" />
              </button>
            )}

            {adminOk && (
              <Link
                href="/admin"
                aria-label={t("admin")}
                title={t("admin")}
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-ink/60 transition hover:rotate-45 hover:border-leaf hover:text-leaf"
              >
                <IconGear className="h-5 w-5" />
              </Link>
            )}

            <button
              onClick={openDrawer}
              aria-label={t("cart")}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition hover:bg-navy dark:bg-navy dark:hover:bg-leaf"
            >
              <IconCart className="h-5 w-5" />
              {isHydrated && count > 0 && (
                <span
                  key={count}
                  className="animate-pop absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf-bright px-1 text-[10px] font-extrabold text-ink"
                >
                  {count.toLocaleString("ar-EG")}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={submitSearch} className="relative px-4 pb-3 md:hidden">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder={t("searchPhShort")}
            className="input-base rounded-full border-2 border-line py-2.5 pl-12"
          />
          <button
            type="submit"
            aria-label="search"
            className="absolute left-5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-navy text-white"
          >
            <IconSearch className="h-4 w-4" />
          </button>
        </form>

        {/* Category nav */}
        <nav className="border-t border-line/70">
          <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6">
            <Link
              href="/shop"
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-bold transition ${
                pathname === "/shop"
                  ? "border-leaf text-leaf"
                  : "border-transparent text-ink/70 hover:text-navy dark:hover:text-leaf-bright"
              }`}
            >
              {t("allProducts")}
            </Link>
            {categories.map((c) => {
              const active = pathname === `/shop?cat=${c.slug}`;
              return (
                <Link
                  key={c.slug}
                  href={`/shop?cat=${c.slug}`}
                  className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-bold transition ${
                    active
                      ? "border-leaf text-leaf"
                      : "border-transparent text-ink/70 hover:text-navy dark:hover:text-leaf-bright"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
            <Link
              href="/shop?sale=1"
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-[13px] font-extrabold text-clay transition hover:opacity-75"
            >
              {t("deals")}
            </Link>
          </div>
        </nav>
      </div>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}

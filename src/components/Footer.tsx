import Link from "next/link";
import { T } from "@/lib/i18n";
import {
  IconFacebook,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
  IconTelegram,
  IconWhatsApp,
  IconYoutube,
} from "./icons";
import type { StoreSettings } from "@/lib/store";

interface CategoryLite {
  name: string;
  slug: string;
}

export default function Footer({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: CategoryLite[];
}) {
  const socials = [
    { href: settings.socialFacebook, icon: IconFacebook, label: "فيسبوك" },
    { href: settings.socialInstagram, icon: IconInstagram, label: "إنستغرام" },
    { href: settings.socialYoutube, icon: IconYoutube, label: "يوتيوب" },
    { href: settings.socialTelegram, icon: IconTelegram, label: "تيليجرام" },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden bg-navy-deep text-white">
      <div className="gold-hairline absolute inset-x-0 top-0 h-px" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="شعار عابدين"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
            />
            <span>
              <span className="font-display block text-2xl font-extrabold">
                {settings.storeName}
              </span>
              <span className="text-[9px] font-bold tracking-[0.35em] text-leaf-bright">
                {settings.storeTagline}
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
            {settings.aboutText}
          </p>
          <div className="mt-5 flex gap-2.5">
            <a
              href={`https://wa.me/2${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="واتساب"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:-translate-y-0.5 hover:bg-leaf"
            >
              <IconWhatsApp className="h-5 w-5" />
            </a>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:-translate-y-0.5 hover:bg-leaf"
              >
                <s.icon className="h-4.5 w-4.5" />
              </a>
            ))}
            <a
              href={`mailto:${settings.email}`}
              aria-label="بريد إلكتروني"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:-translate-y-0.5 hover:bg-leaf"
            >
              <IconMail className="h-5 w-5" />
            </a>
            <a
              href={`tel:${settings.phone}`}
              aria-label="هاتف"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:-translate-y-0.5 hover:bg-leaf"
            >
              <IconPhone className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display mb-4 text-base font-extrabold">
            <T k="fCats" />
          </h3>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li>
              <Link href="/shop" className="transition hover:text-leaf-bright">
                <T k="allProducts" />
              </Link>
            </li>
            {categories.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?cat=${c.slug}`}
                  className="transition hover:text-leaf-bright"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display mb-4 text-base font-extrabold">
            <T k="fInfo" />
          </h3>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li>
              <Link href="/shop?sale=1" className="transition hover:text-leaf-bright">
                <T k="deals" />
              </Link>
            </li>
            <li>
              <Link href="/shop?fresh=1" className="transition hover:text-leaf-bright">
                <T k="newArrivals" />
              </Link>
            </li>
            <li>
              <Link href="/shop?best=1" className="transition hover:text-leaf-bright">
                <T k="bestTitle" />
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="transition hover:text-leaf-bright">
                <T k="faqLink" />
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-leaf-bright">
                <T k="termsUse" />
              </Link>
            </li>
            <li>
              <Link href="/returns" className="transition hover:text-leaf-bright">
                <T k="retPolicy" />
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:text-leaf-bright">
                <T k="privPolicy" />
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display mb-4 text-base font-extrabold">
            <T k="fContact" />
          </h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-center gap-2.5">
              <IconPin className="h-4 w-4 shrink-0 text-leaf-bright" />
              {settings.address}
            </li>
            <li className="flex items-center gap-2.5" dir="ltr">
              <IconPhone className="h-4 w-4 shrink-0 text-leaf-bright" />
              {settings.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <IconMail className="h-4 w-4 shrink-0 text-leaf-bright" />
              <span dir="ltr">{settings.email}</span>
            </li>
          </ul>
          {settings.workingHours && (
            <p className="mt-4 whitespace-pre-line rounded-xl bg-white/5 px-4 py-3 text-xs leading-6 text-white/55">
              <span className="mb-1 block font-extrabold text-white/80">
                مواعيد العمل
              </span>
              {settings.workingHours}
            </p>
          )}
          <p className="mt-3 rounded-xl bg-white/5 px-4 py-3 text-xs leading-6 text-white/50">
            {settings.paymentNote}
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.storeName} ·{" "}
            <T k="allRights" />
          </p>
          <p>
            <T k="madeIn" />
          </p>
        </div>
      </div>
    </footer>
  );
}

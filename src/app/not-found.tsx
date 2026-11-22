import Link from "next/link";
import StoreShell from "@/components/StoreShell";
import { IconArrow } from "@/components/icons";
import { T } from "@/lib/i18n";

export default function NotFound() {
  return (
    <StoreShell>
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
        <p className="font-display text-[7rem] font-black leading-none text-navy/15">
          404
        </p>
        <h1 className="font-display mt-2 text-3xl font-black">
          <T k="nfTitle" />
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink/55">
          <T k="nfDesc" />
        </p>
        <Link
          href="/"
          className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-leaf px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-leaf/25 transition hover:bg-leaf/90"
        >
          <T k="goHome" />
          <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </StoreShell>
  );
}

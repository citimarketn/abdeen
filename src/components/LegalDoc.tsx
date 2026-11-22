import Link from "next/link";
import type { ReactNode } from "react";

/** Render legal text: "# " title, "## " heading, other lines paragraphs. */
export function LegalDoc({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((ln, i) => {
        const t = ln.trim();
        if (!t) return null;
        if (t.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-display mt-8 border-r-4 border-leaf pr-3 text-lg font-extrabold text-ink"
            >
              {t.slice(3)}
            </h2>
          );
        }
        if (t.startsWith("# ")) {
          return (
            <h1 key={i} className="font-display text-3xl font-black text-ink">
              {t.slice(2)}
            </h1>
          );
        }
        return (
          <p key={i} className="mt-4 text-[15px] leading-8 text-ink/70">
            {t}
          </p>
        );
      })}
    </div>
  );
}

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <nav className="mb-5 flex items-center gap-2 text-xs text-ink/45">
        <Link href="/" className="hover:text-leaf">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="font-bold text-leaf">{title}</span>
      </nav>

      <div className="overflow-hidden rounded-3xl bg-paper ring-1 ring-line">
        <div className="relative border-b border-line px-7 py-8 sm:px-10">
          <div className="gold-hairline absolute inset-x-0 bottom-0 h-px" />
          <h1 className="font-display text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 text-xs font-bold text-ink/40">
            آخر تحديث: {updated}
          </p>
        </div>
        <div className="px-7 py-8 sm:px-10">{children}</div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <Link
          href="/terms"
          className="rounded-full bg-paper px-4 py-2 font-bold text-ink/60 ring-1 ring-line transition hover:text-leaf"
        >
          شروط الاستخدام
        </Link>
        <Link
          href="/returns"
          className="rounded-full bg-paper px-4 py-2 font-bold text-ink/60 ring-1 ring-line transition hover:text-leaf"
        >
          سياسة الاسترجاع
        </Link>
        <Link
          href="/privacy"
          className="rounded-full bg-paper px-4 py-2 font-bold text-ink/60 ring-1 ring-line transition hover:text-leaf"
        >
          سياسة الخصوصية
        </Link>
      </div>
    </div>
  );
}

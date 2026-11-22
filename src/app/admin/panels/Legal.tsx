"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface LegalForm {
  legalTerms: string;
  legalReturns: string;
  legalPrivacy: string;
  legalUpdated: string;
}

const SECTIONS: Array<{ key: keyof LegalForm; title: string; hint: string }> = [
  {
    key: "legalTerms",
    title: "شروط الاستخدام",
    hint: "تظهر في /terms",
  },
  {
    key: "legalReturns",
    title: "سياسة الاسترجاع والاستبدال",
    hint: "تظهر في /returns",
  },
  {
    key: "legalPrivacy",
    title: "سياسة الخصوصية",
    hint: "تظهر في /privacy",
  },
];

export default function LegalPanel() {
  const router = useRouter();
  const [form, setForm] = useState<LegalForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ settings: LegalForm & Record<string, string> }>(
      "/api/admin/settings"
    )
      .then((d) =>
        setForm({
          legalTerms: d.settings.legalTerms ?? "",
          legalReturns: d.settings.legalReturns ?? "",
          legalPrivacy: d.settings.legalPrivacy ?? "",
          legalUpdated: d.settings.legalUpdated ?? "2026",
        })
      )
      .catch(() => {});
  }, []);

  if (!form) {
    return (
      <div className="grid place-items-center rounded-2xl bg-paper py-20 ring-1 ring-line">
        <p className="text-sm text-ink/50">جارٍ تحميل السياسات…</p>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/admin/settings", { method: "PUT", body: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-4xl space-y-6">
      <div className="rounded-2xl bg-mint/60 px-5 py-4 text-xs leading-6 text-ink/65 ring-1 ring-mint-deep/40">
        <p className="font-extrabold text-leaf">تحرير كامل للسياسات القانونية</p>
        اكتب «# » في بداية السطر للعنوان الرئيسي، و«## » للعناوين الفرعية،
        وكل سطر عادي يظهر كفقرة. التعديلات تنعكس على الموقع فور الحفظ.
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-paper p-5 ring-1 ring-line">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink/60">
            تاريخ آخر تحديث (يظهر أعلى كل سياسة)
          </label>
          <input
            value={form.legalUpdated}
            onChange={(e) =>
              setForm({ ...form, legalUpdated: e.target.value })
            }
            className="input-base w-40"
            dir="ltr"
          />
        </div>
        {saved && (
          <span className="animate-fade-in text-sm font-extrabold text-leaf">
            تم الحفظ ✓
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="ms-auto rounded-xl bg-leaf px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-leaf/25 transition hover:bg-leaf/90 disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ…" : "حفظ كل السياسات"}
        </button>
      </div>

      {SECTIONS.map((s) => (
        <section
          key={s.key}
          className="rounded-2xl bg-paper p-6 ring-1 ring-line"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold">
              {s.title}
            </h2>
            <a
              href={`/${s.key === "legalTerms" ? "terms" : s.key === "legalReturns" ? "returns" : "privacy"}`}
              target="_blank"
              className="text-[11px] font-bold text-leaf hover:underline"
            >
              {s.hint} ← عرض
            </a>
          </div>
          <textarea
            value={form[s.key]}
            onChange={(e) =>
              setForm({ ...form, [s.key]: e.target.value })
            }
            className="input-base min-h-72 font-mono text-[13px] leading-7"
          />
        </section>
      ))}
    </form>
  );
}

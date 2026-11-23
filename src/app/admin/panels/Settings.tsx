"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { IconKey, IconLock } from "@/components/icons";

interface RawSettings {
  storeName: string;
  storeTagline: string;
  ticker: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaSecondary: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  freeShippingOver: string;
  shippingFee: string;
  freeShippingEnabled: string;
  currency: string;
  paymentNote: string;
  aboutText: string;
  adminEmail: string;
  secCode1: string;
  secCode2: string;
  secCode3: string;
  googleClientId: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTelegram: string;
  heroBg: string;
  heroBgMotion: string;
  shopBg: string;
  shopBgMotion: string;
  cartBg: string;
  siteBg: string;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCta: string;
  bannerLink: string;
  showCollections: string;
  showDeals: string;
  showBest: string;
  showValues: string;
  showTestimonials: string;
  showBanner: string;
  showFaq: string;
  heroImage: string;
  heroStat1: string;
  heroStat2: string;
  heroStat3: string;
  heroBadge: string;
  workingHours: string;
  emailProvider: string;
  emailApiKey: string;
  emailFrom: string;
  firebaseProject: string;
  paMailUrl: string;
  paMailKey: string;
}

const MOTIONS = [
  { v: "static", l: "ثابتة" },
  { v: "zoom", l: "صورة متحركة (تكبير تدريجي)" },
  { v: "pan", l: "عرض متابع (تحريك أفقي)" },
];

const HOME_SECTIONS: Array<{ key: keyof RawSettings; label: string }> = [
  { key: "showCollections", label: "التشكيلات المميزة" },
  { key: "showDeals", label: "العروض والخصومات" },
  { key: "showBest", label: "الأكثر مبيعًا" },
  { key: "showValues", label: "شريط مزايا المتجر" },
  { key: "showTestimonials", label: "آراء العملاء" },
  { key: "showBanner", label: "بانر الهدايا" },
  { key: "showFaq", label: "الأسئلة الشائعة" },
];

export default function SettingsPanel() {
  const router = useRouter();
  const [form, setForm] = useState<RawSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ settings: RawSettings }>("/api/admin/settings")
      .then((d) => setForm(d.settings))
      .catch(() => setForm(null));
  }, []);

  if (!form) {
    return (
      <div className="grid place-items-center rounded-2xl bg-paper py-20 ring-1 ring-line">
        <p className="text-sm text-ink/50">جارٍ تحميل الإعدادات…</p>
      </div>
    );
  }

  const set =
    (k: keyof RawSettings) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm({ ...form, [k]: e.target.value });

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
      <Section title="هوية المتجر">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المتجر">
            <input value={form.storeName} onChange={set("storeName")} className="input-base" />
          </Field>
          <Field label="الشعار النصي (إنجليزي)">
            <input value={form.storeTagline} onChange={set("storeTagline")} className="input-base" dir="ltr" />
          </Field>
          <Field label="نص التعريف (يظهر في الفوتر)" full>
            <textarea value={form.aboutText} onChange={set("aboutText")} className="input-base min-h-20" />
          </Field>
        </div>
      </Section>

      <Section title="شريط الإعلانات المتحرك" hint="سطر واحد لكل إعلان">
        <textarea value={form.ticker} onChange={set("ticker")} className="input-base min-h-28" />
      </Section>

      <Section title="الواجهة الرئيسية (Hero)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="شارة فوق العنوان" full>
            <input value={form.heroKicker} onChange={set("heroKicker")} className="input-base" />
          </Field>
          <Field label="العنوان الرئيسي">
            <input value={form.heroTitle} onChange={set("heroTitle")} className="input-base" />
          </Field>
          <Field label="الزر الثانوي">
            <input value={form.heroCtaSecondary} onChange={set("heroCtaSecondary")} className="input-base" />
          </Field>
          <Field label="النص الوصفي" full>
            <textarea value={form.heroSubtitle} onChange={set("heroSubtitle")} className="input-base min-h-24" />
          </Field>
          <Field label="نص الزر الرئيسي">
            <input value={form.heroCta} onChange={set("heroCta")} className="input-base" />
          </Field>
          <Field label="صورة الواجهة الرئيسية (العمود المصوّر)">
            <input value={form.heroImage} onChange={set("heroImage")} dir="ltr" className="input-base font-mono text-[11px]" placeholder="/images/hero.jpg أو رابط" />
          </Field>
          <Field label="خلفية الواجهة الرئيسية (اختياري) — رابط صورة">
            <input value={form.heroBg} onChange={set("heroBg")} dir="ltr" className="input-base font-mono text-[11px]" placeholder="https://… أو /images/… " />
          </Field>
          <Field label="الدائرة الحمراء على الصورة (اتركها فارغة للإخفاء)">
            <input value={form.heroBadge} onChange={set("heroBadge")} className="input-base" dir="ltr" placeholder="-40%" />
          </Field>
          <div className="grid grid-cols-3 gap-3 sm:col-span-2">
            <Field label="رقم 1 (العملاء)">
              <input value={form.heroStat1} onChange={set("heroStat1")} className="input-base" dir="ltr" />
            </Field>
            <Field label="رقم 2 (التقييم)">
              <input value={form.heroStat2} onChange={set("heroStat2")} className="input-base" dir="ltr" />
            </Field>
            <Field label="رقم 3 (المحافظات)">
              <input value={form.heroStat3} onChange={set("heroStat3")} className="input-base" dir="ltr" />
            </Field>
          </div>
          <Field label="حركة خلفية الواجهة">
            <select value={form.heroBgMotion} onChange={set("heroBgMotion")} className="input-base cursor-pointer">
              {MOTIONS.map((m) => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="الخلفيات" hint="تحكم في خلفية المتجر كاملة">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="خلفية صفحة المنتجات والأقسام — رابط صورة">
            <input value={form.shopBg} onChange={set("shopBg")} dir="ltr" className="input-base font-mono text-[11px]" placeholder="https://…" />
          </Field>
          <Field label="حركة خلفية صفحة المنتجات">
            <select value={form.shopBgMotion} onChange={set("shopBgMotion")} className="input-base cursor-pointer">
              {MOTIONS.map((m) => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
          </Field>
          <Field label="خلفية السلة — رابط صورة">
            <input value={form.cartBg} onChange={set("cartBg")} dir="ltr" className="input-base font-mono text-[11px]" placeholder="https://…" />
          </Field>
          <Field label="خلفية عامة للموقع (باهتة خلف كل الصفحات)">
            <input value={form.siteBg} onChange={set("siteBg")} dir="ltr" className="input-base font-mono text-[11px]" placeholder="https://…" />
          </Field>
        </div>
      </Section>

      <Section title="بانر العرض (هدايا)" hint="تحكم كامل في صورة البانر ونصوصه">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="صورة البانر">
            <input value={form.bannerImage} onChange={set("bannerImage")} dir="ltr" className="input-base font-mono text-[11px]" />
          </Field>
          <Field label="رابط زر البانر">
            <input value={form.bannerLink} onChange={set("bannerLink")} dir="ltr" className="input-base font-mono text-[11px]" />
          </Field>
          <Field label="عنوان البانر">
            <input value={form.bannerTitle} onChange={set("bannerTitle")} className="input-base" />
          </Field>
          <Field label="نص الزر">
            <input value={form.bannerCta} onChange={set("bannerCta")} className="input-base" />
          </Field>
          <Field label="النص الوصفي" full>
            <textarea value={form.bannerSubtitle} onChange={set("bannerSubtitle")} className="input-base min-h-20" />
          </Field>
        </div>
      </Section>

      <Section title="أقسام الرئيسية" hint="اختر الأقسام الظاهرة في الصفحة الرئيسية">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {HOME_SECTIONS.map((s) => (
            <label
              key={s.key}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-line bg-paper px-3 py-2.5 text-xs font-bold transition hover:border-leaf/40"
            >
              <input
                type="checkbox"
                checked={form[s.key] === "yes"}
                onChange={(e) =>
                  setForm({ ...form, [s.key]: e.target.checked ? "yes" : "no" })
                }
                className="h-4 w-4 accent-[#1da463]"
              />
              {s.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="الشحن والدفع">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="التوصيل المجاني">
            <select
              value={form.freeShippingEnabled}
              onChange={set("freeShippingEnabled")}
              className="input-base cursor-pointer"
            >
              <option value="yes">مفعّل (فوق الحد أدناه)</option>
              <option value="no">معطّل (رسوم ثابتة)</option>
            </select>
          </Field>
          <Field label="حد الشحن المجاني">
            <input type="number" min="0" value={form.freeShippingOver} onChange={set("freeShippingOver")} className="input-base" dir="ltr" />
          </Field>
          <Field label="رسوم التوصيل">
            <input type="number" min="0" value={form.shippingFee} onChange={set("shippingFee")} className="input-base" dir="ltr" />
          </Field>
          <Field label="العملة">
            <input value={form.currency} onChange={set("currency")} className="input-base" />
          </Field>
          <Field label="ملاحظة طريقة الدفع" full>
            <input value={form.paymentNote} onChange={set("paymentNote")} className="input-base" />
          </Field>
        </div>
      </Section>

      <Section title="التواصل وروابط السوشيال ميديا">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="واتساب / موبايل">
            <input value={form.whatsapp} onChange={set("whatsapp")} className="input-base" dir="ltr" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input value={form.email} onChange={set("email")} className="input-base" dir="ltr" />
          </Field>
          <Field label="الهاتف">
            <input value={form.phone} onChange={set("phone")} className="input-base" dir="ltr" />
          </Field>
          <Field label="العنوان">
            <input value={form.address} onChange={set("address")} className="input-base" />
          </Field>
          <Field label="مواعيد العمل (تظهر في الفوتر)" full>
            <textarea value={form.workingHours} onChange={set("workingHours")} className="input-base min-h-16" />
          </Field>
          <Field label="رابط فيسبوك">
            <input value={form.socialFacebook} onChange={set("socialFacebook")} dir="ltr" className="input-base font-mono text-[11px]" />
          </Field>
          <Field label="رابط إنستغرام">
            <input value={form.socialInstagram} onChange={set("socialInstagram")} dir="ltr" className="input-base font-mono text-[11px]" />
          </Field>
          <Field label="رابط يوتيوب">
            <input value={form.socialYoutube} onChange={set("socialYoutube")} dir="ltr" className="input-base font-mono text-[11px]" />
          </Field>
          <Field label="رابط تيليجرام">
            <input value={form.socialTelegram} onChange={set("socialTelegram")} dir="ltr" className="input-base font-mono text-[11px]" />
          </Field>
        </div>
      </Section>

      <Section
        title="البريد الإلكتروني (رسائل الترحيب)"
        hint="عند تسجيل عضو جديد تصله فورًا رسالة تأكيد تفعيل + ترحيب"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="مزود الإرسال">
            <select
              value={form.emailProvider}
              onChange={set("emailProvider")}
              className="input-base cursor-pointer"
            >
              <option value="none">معطّل (تسجيل في الصندوق فقط)</option>
              <option value="pa">PythonAnywhere (خدمتك الخاصة — مجاني)</option>
              <option value="resend">Resend</option>
              <option value="brevo">Brevo (Sendinblue)</option>
            </select>
          </Field>
          <Field label="اسم المرسل / البريد">
            <input
              value={form.emailFrom}
              onChange={set("emailFrom")}
              className="input-base font-mono text-[11px]"
              dir="ltr"
            />
          </Field>
          {form.emailProvider === "pa" && (
            <>
              <Field label="رابط خدمة البريد على PythonAnywhere" full>
                <input
                  value={form.paMailUrl}
                  onChange={set("paMailUrl")}
                  className="input-base font-mono text-[11px]"
                  dir="ltr"
                  placeholder="https://yourname.pythonanywhere.com/send"
                />
              </Field>
              <Field label="سر المشاركة (نفس MAIL_SECRET في بايثون)" full>
                <input
                  value={form.paMailKey}
                  onChange={set("paMailKey")}
                  className="input-base font-mono text-[11px]"
                  dir="ltr"
                />
              </Field>
            </>
          )}
          <Field label="اسم المرسل / البريد">
            <input
              value={form.emailFrom}
              onChange={set("emailFrom")}
              className="input-base font-mono text-[11px]"
              dir="ltr"
            />
          </Field>
          <Field label="API Key" full>
            <input
              value={form.emailApiKey}
              onChange={set("emailApiKey")}
              className="input-base font-mono text-[11px]"
              dir="ltr"
              placeholder="re_…"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="التكامل"
        hint="نموذج البيانات متوافق مع Firestore — اربط مشروعك مستقبلًا"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم مشروع Firebase (اختياري)">
            <input
              value={form.firebaseProject}
              onChange={set("firebaseProject")}
              className="input-base font-mono text-[11px]"
              dir="ltr"
              placeholder="abdeen-store"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="الأمان"
        hint="الإيميل المخوّل هو حساب المالك — الأكواد الثلاثة مطلوبة بعد كلمة المرور"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="إيميل المالك (حساب المسؤول)">
          <input value={form.adminEmail} onChange={set("adminEmail")} className="input-base" dir="ltr" />
          </Field>
          <Field label="معرّف Google Client ID (للدخول بحساب جوجل — اختياري)">
            <input value={form.googleClientId} onChange={set("googleClientId")} dir="ltr" className="input-base font-mono text-[10px]" placeholder="xxxxxxxx.apps.googleusercontent.com" />
          </Field>
          <div className="hidden sm:block" />
          <Field label="رمز الحماية الأول">
            <input value={form.secCode1} onChange={set("secCode1")} className="input-base font-mono tracking-widest" dir="ltr" />
          </Field>
          <Field label="رمز الحماية الثاني">
            <input value={form.secCode2} onChange={set("secCode2")} className="input-base font-mono tracking-widest" dir="ltr" />
          </Field>
          <Field label="رمز الحماية الثالث">
            <input value={form.secCode3} onChange={set("secCode3")} className="input-base font-mono tracking-widest" dir="ltr" />
          </Field>
        </div>
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-mint/60 px-4 py-3 text-[11px] font-bold leading-5 text-ink/60">
          <IconLock className="h-4 w-4 shrink-0 text-leaf" />
          لوحة التحكم تظهر فقط لمن دخل بنجاح: المالك بحسابه أو جوجل، والمشرفين الذين أضفتهم من «الفريق والصلاحيات».
          <IconKey className="h-3.5 w-3.5 shrink-0 text-leaf" />
        </p>
      </Section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-leaf px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-leaf/25 transition hover:bg-leaf/90 disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ…" : "حفظ كل الإعدادات"}
        </button>
        {saved && (
          <span className="animate-fade-in text-sm font-extrabold text-leaf">
            تم الحفظ بنجاح ✓
          </span>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-paper p-6 ring-1 ring-line">
      <h2 className="font-display text-base font-extrabold">{title}</h2>
      {hint && <p className="mt-1 text-[11px] text-ink/45">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-bold text-ink/60">{label}</label>
      {children}
    </div>
  );
}

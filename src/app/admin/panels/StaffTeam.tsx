"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  IconCheck,
  IconPlus,
  IconTrash,
  IconTruck,
  IconUsers,
} from "@/components/icons";
import { cn, formatDate } from "@/lib/utils";

interface StaffRow {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: "field" | "manager";
  onDuty: boolean;
  dutyRequested: boolean;
  active: boolean;
  permissions: string[];
  createdAt: string;
}

const PERMS = [
  { key: "orders", label: "الطلبات" },
  { key: "reviews", label: "التقييمات" },
  { key: "products", label: "المنتجات" },
  { key: "categories", label: "الأقسام" },
];

export default function StaffTeamPanel() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    role: "field" as "field" | "manager",
    permissions: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ staff: StaffRow[] }>("/api/admin/staff")
      .then((d) => setStaff(d.staff))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(null), 2400);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api("/api/admin/staff", { method: "POST", body: form });
      setForm({ name: "", email: "", whatsapp: "", role: "field", permissions: [] });
      notify("تمت إضافة العضو — هيقدر يدخل بنفس إيميله في تسجيل دخول المتجر");
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "فشل الإضافة");
    }
  };

  const patch = (id: number, body: Record<string, unknown>, msg: string) =>
    api("/api/admin/staff", { method: "PATCH", body: { id, ...body } }).then(
      () => {
        notify(msg);
        load();
      }
    );

  const remove = async (s: StaffRow) => {
    if (confirmId !== s.id) {
      setConfirmId(s.id);
      setTimeout(() => setConfirmId(null), 3000);
      return;
    }
    await api(`/api/admin/staff?id=${s.id}`, { method: "DELETE" });
    setConfirmId(null);
    notify("تم حذف العضو");
    load();
  };

  return (
    <div className="space-y-6">
      {flash && (
        <span className="animate-fade-in inline-block rounded-full bg-leaf/15 px-3 py-1.5 text-xs font-extrabold text-leaf">
          {flash}
        </span>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_1.5fr]">
        {/* Add member */}
        <form
          onSubmit={add}
          className="rounded-2xl bg-paper p-6 ring-1 ring-line"
        >
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
            <IconUsers className="h-4.5 w-4.5 text-navy" />
            إضافة عضو للفريق
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-ink/45">
            هيدخل بنفس الإيميل في تسجيل دخول المتجر (أو جوجل)، وطلب الزبون بيتحول
            لواتسابه تلقائيًا وهو في الدوام.
          </p>
          <div className="mt-4 space-y-3.5">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="الاسم"
              className="input-base"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="البريد الإلكتروني (نفس دخول المتجر)"
              className="input-base"
              dir="ltr"
            />
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="واتساب مع كود الدولة — مثال: 201012345678"
              className="input-base font-mono text-[11px]"
              dir="ltr"
            />
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: "field", l: "فريق ميداني (استقبال الطلبات)" },
                  { v: "manager", l: "مسؤول (اختصاصات محددة)" },
                ] as const
              ).map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.v })}
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 text-[11px] font-extrabold transition",
                    form.role === r.v
                      ? "border-leaf bg-mint/60"
                      : "border-line bg-paper hover:border-leaf/40"
                  )}
                >
                  {r.l}
                </button>
              ))}
            </div>
            {form.role === "manager" && (
              <div className="flex flex-wrap gap-2">
                {PERMS.map((p) => (
                  <label
                    key={p.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-[11px] font-bold transition",
                      form.permissions.includes(p.key)
                        ? "border-leaf bg-mint/60"
                        : "border-line bg-paper"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-[#1da463]"
                      checked={form.permissions.includes(p.key)}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          permissions: f.permissions.includes(p.key)
                            ? f.permissions.filter((x) => x !== p.key)
                            : [...f.permissions, p.key],
                        }))
                      }
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            )}
            {formError && (
              <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay">
                {formError}
              </p>
            )}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-xs font-extrabold text-white transition hover:bg-navy-deep"
            >
              <IconPlus className="h-4 w-4" />
              إضافة للوحة
            </button>
          </div>
        </form>

        {/* Team list */}
        <ul className="space-y-3">
          {staff.length === 0 && (
            <li className="rounded-2xl bg-paper py-14 text-center text-sm text-ink/40 ring-1 ring-line">
              الفريق فاضي — أضف أول عضو هيتحكم في استقبال الطلبات.
            </li>
          )}
          {staff.map((s) => (
            <li
              key={s.id}
              className={cn(
                "rounded-2xl bg-paper p-5 ring-1 ring-line transition",
                !s.active && "opacity-60"
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "font-display grid h-11 w-11 place-items-center rounded-full text-base font-black",
                    s.role === "manager" ? "bg-gold/20 text-gold" : "bg-mint text-leaf"
                  )}
                >
                  {s.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold">{s.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-black",
                        s.role === "manager"
                          ? "bg-gold/15 text-gold"
                          : "bg-mint text-leaf"
                      )}
                    >
                      {s.role === "manager" ? "مسؤول" : "فريق ميداني"}
                    </span>
                    {s.onDuty && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-leaf px-2 py-0.5 text-[9px] font-black text-white">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        في الدوام — ظاهر للعامة
                      </span>
                    )}
                    {s.dutyRequested && !s.onDuty && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-black text-gold">
                        طلب تواجد بانتظار موافقتك
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink/45" dir="ltr">
                    {s.email} · {s.whatsapp}
                  </span>
                  {s.role === "manager" && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {s.permissions.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-cream px-2 py-0.5 text-[9px] font-bold text-ink/50 ring-1 ring-line"
                        >
                          {PERMS.find((x) => x.key === p)?.label ?? p}
                        </span>
                      ))}
                    </span>
                  )}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {s.dutyRequested && (
                    <button
                      onClick={() =>
                        patch(
                          s.id,
                          { onDuty: true, dutyRequested: false },
                          `وافق على تواجد ${s.name} — بيبان للعامة دلوقتي`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-3 py-2 text-[10px] font-black text-white transition hover:bg-leaf/90"
                    >
                      <IconCheck className="h-3.5 w-3.5" />
                      موافقة على الدوام
                    </button>
                  )}
                  {s.onDuty && (
                    <button
                      onClick={() =>
                        patch(s.id, { onDuty: false }, "أخرجته من الدوام")
                      }
                      className="rounded-lg bg-cream px-3 py-2 text-[10px] font-black text-ink/60 ring-1 ring-line transition hover:text-clay"
                    >
                      إخراج من الدوام
                    </button>
                  )}
                  <button
                    onClick={() =>
                      patch(
                        s.id,
                        { active: !s.active },
                        s.active ? "تم إيقاف الحساب" : "تم تفعيل الحساب"
                      )
                    }
                    className={cn(
                      "rounded-lg px-3 py-2 text-[10px] font-black transition",
                      s.active
                        ? "bg-cream text-ink/55 ring-1 ring-line hover:text-clay"
                        : "bg-leaf/15 text-leaf"
                    )}
                  >
                    {s.active ? "إيقاف" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className={cn(
                      "grid h-8 place-items-center rounded-lg transition",
                      confirmId === s.id
                        ? "w-auto bg-clay px-2.5 text-[10px] font-black text-white"
                        : "w-8 text-ink/40 hover:bg-clay/10 hover:text-clay"
                    )}
                  >
                    {confirmId === s.id ? "تأكيد؟" : <IconTrash className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {s.dutyRequested && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-2.5 text-[11px] font-bold text-gold">
                  <IconTruck className="h-4 w-4 shrink-0" />
                  {s.name} طلب المشاركة في الدوام — موافقتك بتخليه يستقبل الطلبات
                  ويظهر للعامة.
                </p>
              )}
              <p className="mt-2 text-[10px] text-ink/35">
                عضو منذ {formatDate(s.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

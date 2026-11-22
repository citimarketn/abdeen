"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { IconPlus, IconTrash, IconUsers } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AdminRow {
  id: number;
  name: string;
  email: string;
  role: "owner" | "supervisor";
  permissions: string[];
  active: boolean;
  createdAt: string;
}

const PERMS: Array<{ key: string; label: string }> = [
  { key: "dashboard", label: "لوحة المعلومات" },
  { key: "products", label: "المنتجات" },
  { key: "orders", label: "الطلبات" },
  { key: "reviews", label: "التقييمات" },
  { key: "categories", label: "الأقسام" },
  { key: "settings", label: "الإعدادات" },
];

export default function TeamPanel() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ admins: AdminRow[] }>("/api/admin/team")
      .then((d) => setAdmins(d.admins))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(null), 2200);
  };

  const togglePerm = (k: string) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(k)
        ? f.permissions.filter((p) => p !== k)
        : [...f.permissions, k],
    }));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api("/api/admin/team", { method: "POST", body: form });
      setForm({ name: "", email: "", password: "", permissions: [] });
      notify("تمت إضافة المشرف");
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "فشل الإضافة");
    }
  };

  const patchPerms = async (a: AdminRow, perms: string[]) => {
    await api("/api/admin/team", {
      method: "PATCH",
      body: { id: a.id, permissions: perms },
    });
    notify("تم تحديث الصلاحيات");
    load();
  };

  const toggleActive = async (a: AdminRow) => {
    await api("/api/admin/team", {
      method: "PATCH",
      body: { id: a.id, active: !a.active },
    });
    notify(a.active ? "تم إيقاف الحساب" : "تم تفعيل الحساب");
    load();
  };

  const remove = async (a: AdminRow) => {
    await api(`/api/admin/team?id=${a.id}`, { method: "DELETE" });
    notify("تم حذف الحساب");
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
        {/* Add supervisor */}
        <form
          onSubmit={add}
          className="rounded-2xl bg-paper p-6 ring-1 ring-line"
        >
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
            <IconUsers className="h-4.5 w-4.5 text-navy" />
            إضافة مشرف
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-ink/45">
            أنشئ حسابًا لمساعدك وحدد الأقسام التي سيملك صلاحية الوصول إليها.
          </p>
          <div className="mt-4 space-y-3.5">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="اسم المشرف"
              className="input-base"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="البريد الإلكتروني"
              className="input-base"
              dir="ltr"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              className="input-base"
              dir="ltr"
            />
            <div>
              <p className="mb-2 text-xs font-bold text-ink/60">الصلاحيات</p>
              <div className="grid grid-cols-2 gap-2">
                {PERMS.map((p) => (
                  <label
                    key={p.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition",
                      form.permissions.includes(p.key)
                        ? "border-leaf bg-mint/60"
                        : "border-line bg-paper hover:border-leaf/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(p.key)}
                      onChange={() => togglePerm(p.key)}
                      className="h-3.5 w-3.5 accent-[#1da463]"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
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
              إضافة إلى الفريق
            </button>
          </div>
        </form>

        {/* Team list */}
        <ul className="space-y-3">
          {admins.map((a) => (
            <li
              key={a.id}
              className={cn(
                "rounded-2xl bg-paper p-5 ring-1 ring-line transition",
                !a.active && "opacity-60"
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full font-display text-base font-black",
                    a.role === "owner"
                      ? "bg-navy text-white"
                      : "bg-mint text-leaf"
                  )}
                >
                  {a.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">{a.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-black",
                        a.role === "owner"
                          ? "bg-gold/20 text-[#a8781a]"
                          : "bg-leaf/15 text-leaf"
                      )}
                    >
                      {a.role === "owner" ? "مالك" : "مشرف"}
                    </span>
                  </span>
                  <span className="block text-[11px] text-ink/45" dir="ltr">
                    {a.email}
                  </span>
                </span>
                {a.role !== "owner" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(a)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[10px] font-extrabold transition",
                        a.active
                          ? "bg-leaf/15 text-leaf hover:bg-clay/10 hover:text-clay"
                          : "bg-ink/10 text-ink/40 hover:bg-leaf/10 hover:text-leaf"
                      )}
                    >
                      {a.active ? "مفعّل" : "موقوف"}
                    </button>
                    <button
                      onClick={() => remove(a)}
                      aria-label="حذف"
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 transition hover:bg-clay/10 hover:text-clay"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {a.role !== "owner" && (
                <div className="mt-4 border-t border-line pt-3.5">
                  <p className="mb-2 text-[10px] font-extrabold text-ink/40">
                    الصلاحيات الحالية{" "}
                    {editId === a.id ? "— اختر ثم احفظ" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PERMS.map((p) => {
                      const has = a.permissions.includes(p.key);
                      return editId === a.id ? (
                        <button
                          key={p.key}
                          onClick={() =>
                            patchPerms(
                              a,
                              has
                                ? a.permissions.filter((x) => x !== p.key)
                                : [...a.permissions, p.key]
                            )
                          }
                          className={cn(
                            "rounded-full px-3 py-1.5 text-[10px] font-extrabold transition",
                            has
                              ? "bg-leaf text-white"
                              : "bg-cream text-ink/40 ring-1 ring-line"
                          )}
                        >
                          {p.label}
                        </button>
                      ) : (
                        <span
                          key={p.key}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-[10px] font-extrabold",
                            has
                              ? "bg-leaf/15 text-leaf"
                              : "bg-cream text-ink/25 ring-1 ring-line"
                          )}
                        >
                          {p.label}
                        </span>
                      );
                    })}
                  </div>
                  {editId === a.id ? (
                    <button
                      onClick={() => setEditId(null)}
                      className="mt-2 text-[10px] font-bold text-leaf hover:underline"
                    >
                      تم — إغلاق التحرير
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditId(a.id)}
                      className="mt-2 text-[10px] font-bold text-navy hover:underline"
                    >
                      تعديل الصلاحيات
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

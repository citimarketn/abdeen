"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { IconCheck, IconPlus, IconTrash } from "@/components/icons";
import { cn } from "@/lib/utils";

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  active: boolean;
}

export default function CategoriesPanel() {
  const router = useRouter();
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ categories: CategoryRow[] }>("/api/admin/categories")
      .then((d) => setCats(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(null), 2200);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api("/api/admin/categories", {
      method: "POST",
      body: { name: name.trim(), image: image.trim() || null },
    });
    setName("");
    setImage("");
    notify("تمت إضافة القسم");
    load();
    router.refresh();
  };

  const saveRename = async (c: CategoryRow) => {
    const newName = (editing[c.id] ?? c.name).trim();
    if (!newName || newName === c.name) {
      setEditing((e) => ({ ...e, [c.id]: c.name }));
      return;
    }
    await api("/api/admin/categories", {
      method: "POST",
      body: { id: c.id, name: newName },
    });
    setEditing((e) => ({ ...e, [c.id]: newName }));
    notify("تم تعديل اسم القسم");
    load();
    router.refresh();
  };

  const toggle = async (c: CategoryRow) => {
    await api("/api/admin/categories", {
      method: "POST",
      body: { id: c.id, name: c.name, active: !c.active },
    });
    load();
    router.refresh();
  };

  const remove = async (c: CategoryRow) => {
    if (confirmId !== c.id) {
      setConfirmId(c.id);
      setTimeout(() => setConfirmId(null), 3000);
      return;
    }
    await api(`/api/admin/categories?id=${c.id}`, { method: "DELETE" });
    setConfirmId(null);
    notify("تم حذف القسم");
    load();
    router.refresh();
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.6fr]">
      <form onSubmit={add} className="rounded-2xl bg-paper p-6 ring-1 ring-line">
        <h2 className="font-display text-base font-extrabold">قسم جديد</h2>
        {flash && (
          <p className="animate-fade-in mt-3 rounded-lg bg-leaf/15 px-3 py-2 text-xs font-extrabold text-leaf">
            {flash}
          </p>
        )}
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink/60">اسم القسم</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ساعات يد"
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink/60">
              رابط صورة القسم (اختياري)
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              dir="ltr"
              placeholder="https://…"
              className="input-base font-mono text-[11px]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-xs font-extrabold text-white transition hover:bg-navy-deep"
          >
            <IconPlus className="h-4 w-4" />
            إضافة القسم
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {cats.map((c) => (
          <li
            key={c.id}
            className={cn(
              "flex flex-wrap items-center gap-4 rounded-2xl bg-paper p-4 ring-1 transition",
              c.active ? "ring-line" : "opacity-60 ring-line"
            )}
          >
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-mint">
              {c.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              )}
            </span>

            <div className="min-w-40 flex-1">
              {editing[c.id] !== undefined ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editing[c.id]}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    className="input-base py-2 text-xs font-bold"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveRename(c)}
                    aria-label="حفظ الاسم"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf text-white transition hover:bg-leaf/90"
                  >
                    <IconCheck className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing((prev) => {
                        const next = { ...prev };
                        delete next[c.id];
                        return next;
                      })
                    }
                    aria-label="إلغاء التعديل"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cream text-ink/50 ring-1 ring-line transition hover:text-clay"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setEditing((prev) => ({ ...prev, [c.id]: c.name }))
                  }
                  className="group flex items-center gap-2"
                >
                  <span className="text-sm font-extrabold transition group-hover:text-navy">
                    {c.name}
                  </span>
                  <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-ink/30 ring-1 ring-line group-hover:text-leaf group-hover:ring-leaf/40">
                    تعديل
                  </span>
                </button>
              )}
              <p className="mt-0.5 font-mono text-[10px] text-ink/40" dir="ltr">
                /{c.slug}
              </p>
            </div>

            <button
              onClick={() => toggle(c)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[10px] font-extrabold transition",
                c.active
                  ? "bg-leaf/15 text-leaf hover:bg-clay/10 hover:text-clay"
                  : "bg-ink/10 text-ink/40 hover:bg-leaf/10 hover:text-leaf"
              )}
            >
              {c.active ? "ظاهر" : "مخفي"}
            </button>
            <button
              onClick={() => remove(c)}
              className={cn(
                "grid h-9 place-items-center rounded-lg transition",
                confirmId === c.id
                  ? "w-auto bg-clay px-3 text-[10px] font-black text-white"
                  : "w-9 text-ink/40 hover:bg-clay/10 hover:text-clay"
              )}
            >
              {confirmId === c.id ? "تأكيد؟" : <IconTrash className="h-4 w-4" />}
            </button>
          </li>
        ))}
        {cats.length === 0 && (
          <li className="rounded-2xl bg-paper py-14 text-center text-sm text-ink/40 ring-1 ring-line">
            لا توجد أقسام
          </li>
        )}
      </ul>
    </div>
  );
}

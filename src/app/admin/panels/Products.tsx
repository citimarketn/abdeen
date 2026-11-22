"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  IconClose,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconVideo,
} from "@/components/icons";
import { cn, formatPrice } from "@/lib/utils";

interface ProductRow {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  sales: number;
  categorySlug: string;
  badge: string | null;
  featured: boolean;
  active: boolean;
  images: string[];
  sizes: string[];
  colors: string[];
  description: string | null;
  videoUrl: string | null;
  deliveryDays: number | null;
  source: string | null;
  createdAt: string;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
}

interface FormState {
  id?: number;
  name: string;
  categorySlug: string;
  price: string;
  oldPrice: string;
  stock: string;
  badge: string;
  featured: boolean;
  active: boolean;
  description: string;
  images: (string | null)[];
  sizes: string;
  colors: string;
  videoUrl: string;
  deliveryDays: string;
  source: "stock" | "dropship";
}

const EMPTY = (cat: string): FormState => ({
  name: "",
  categorySlug: cat,
  price: "",
  oldPrice: "",
  stock: "10",
  badge: "",
  featured: false,
  active: true,
  description: "",
  images: [null, null, null, null],
  sizes: "S\nM\nL",
  colors: "",
  videoUrl: "",
  deliveryDays: "",
  source: "stock",
});

export default function ProductsPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ products: ProductRow[]; categories: CategoryRow[] }>(
      "/api/admin/products"
    )
      .then((d) => {
        setProducts(d.products);
        setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          !q ||
          p.name.includes(q) ||
          p.slug.includes(q) ||
          p.categorySlug.includes(q)
      ),
    [products, q]
  );

  const openEdit = (p: ProductRow) =>
    setForm({
      id: p.id,
      name: p.name,
      categorySlug: p.categorySlug,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      stock: String(p.stock),
      badge: p.badge ?? "",
      featured: p.featured,
      active: p.active,
      description: p.description ?? "",
      images: [p.images[0] ?? null, p.images[1] ?? null, p.images[2] ?? null, p.images[3] ?? null],
      sizes: (p.sizes ?? []).join("\n"),
      colors: (p.colors ?? []).join("\n"),
      videoUrl: p.videoUrl ?? "",
      deliveryDays: p.deliveryDays != null ? String(p.deliveryDays) : "",
      source: p.source === "dropship" ? "dropship" : "stock",
    });

  const uploadImage = async (slot: number, file: File | undefined) => {
    if (!form || !file) return;
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ url: string }>("/api/admin/upload", {
        method: "POST",
        body: fd,
        isFormData: true,
      });
      setForm((f) => {
        if (!f) return f;
        const images = [...f.images];
        images[slot] = res.url;
        return { ...f, images };
      });
      setFlash("تم رفع الصورة");
      setTimeout(() => setFlash(null), 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploadingSlot(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError(null);
    try {
      await api("/api/admin/products", {
        method: "POST",
        body: {
          id: form.id,
          name: form.name,
          categorySlug: form.categorySlug,
          price: Number(form.price),
          oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
          stock: Number(form.stock),
          badge: form.badge || null,
          featured: form.featured,
          active: form.active,
          description: form.description,
          images: form.images.filter(Boolean),
          sizes: form.sizes,
          colors: form.colors,
          videoUrl: form.videoUrl,
          deliveryDays: form.deliveryDays,
          source: form.source,
        },
      });
      setForm(null);
      setFlash("تم حفظ المنتج بنجاح");
      setTimeout(() => setFlash(null), 2500);
      load();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId(null), 3000);
      return;
    }
    await api(`/api/admin/products?id=${id}`, { method: "DELETE" });
    setConfirmId(null);
    load();
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم أو القسم…"
            className="input-base w-64"
          />
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        </div>
        <span className="text-xs font-bold text-ink/40">
          {filtered.length.toLocaleString("ar-EG")} منتج
        </span>
        {flash && (
          <span className="animate-fade-in rounded-full bg-leaf/15 px-3 py-1.5 text-xs font-extrabold text-leaf">
            {flash}
          </span>
        )}
        <button
          onClick={() => setForm(EMPTY(categories[0]?.slug ?? "womens"))}
          className="ms-auto inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-xs font-extrabold text-white transition hover:bg-navy-deep"
        >
          <IconPlus className="h-4 w-4" />
          منتج جديد
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-line">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-line text-[11px] font-extrabold text-ink/40">
              <th className="px-4 py-3 text-start">المنتج</th>
              <th className="px-4 py-3 text-start">القسم</th>
              <th className="px-4 py-3 text-start">السعر</th>
              <th className="px-4 py-3 text-start">المخزون</th>
              <th className="px-4 py-3 text-start">إضافات</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id} className="transition hover:bg-mint/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-mint">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <span className="line-clamp-1 max-w-52 text-xs font-bold">
                      {p.name}
                      {p.featured && (
                        <span className="ms-2 rounded-full bg-gold/20 px-2 py-0.5 text-[9px] font-black text-[#a8781a]">
                          مميز
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-ink/55">
                  {categories.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug}
                </td>
                <td className="px-4 py-3">
                  <span className="block text-xs font-extrabold text-navy">
                    {formatPrice(p.price)}
                  </span>
                  {p.oldPrice && (
                    <span className="text-[10px] text-ink/35 line-through">
                      {formatPrice(p.oldPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                      p.stock <= 0
                        ? "bg-clay/15 text-clay"
                        : p.stock <= 10
                          ? "bg-gold/20 text-[#a8781a]"
                          : "bg-mint text-leaf"
                    )}
                  >
                    {p.stock.toLocaleString("ar-EG")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold">
                    {p.badge && (
                      <span className="rounded-full bg-navy/10 px-2 py-1 text-navy">{p.badge}</span>
                    )}
                    {p.videoUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-clay/10 px-2 py-1 text-clay">
                        <IconVideo className="h-3 w-3" />
                        فيديو
                      </span>
                    )}
                    {p.deliveryDays != null && (
                      <span className="rounded-full bg-leaf/15 px-2 py-1 text-leaf">
                        {p.deliveryDays} يوم
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                      p.active ? "bg-leaf/15 text-leaf" : "bg-ink/10 text-ink/40"
                    )}
                  >
                    {p.active ? "نشط" : "مخفي"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label="تعديل"
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink/45 transition hover:bg-navy/10 hover:text-navy"
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="حذف"
                      className={cn(
                        "grid h-8 place-items-center rounded-lg transition",
                        confirmId === p.id
                          ? "w-auto bg-clay px-2.5 text-[10px] font-black text-white"
                          : "w-8 text-ink/45 hover:bg-clay/10 hover:text-clay"
                      )}
                    >
                      {confirmId === p.id ? "تأكيد؟" : <IconTrash className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-ink/40">لا توجد منتجات مطابقة</p>
        )}
      </div>

      {/* Modal */}
      {form && (
        <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
          <div className="animate-fade-up my-4 w-full max-w-3xl rounded-3xl bg-cream shadow-2xl">
            <div className="flex items-center justify-between rounded-t-3xl border-b border-line bg-paper px-6 py-4">
              <h2 className="font-display text-lg font-black">
                {form.id ? "تعديل منتج" : "منتج جديد"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-line transition hover:rotate-90"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={save} className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  اسم المنتج *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-base"
                />
              </div>

              {/* Images: 4 slots */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-ink/60">
                  صور المنتج — حتى 4 (رفع من جهازك أو رابط مباشر)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {form.images.map((img, i) => (
                    <ImageSlot
                      key={i}
                      index={i}
                      value={img}
                      uploading={uploadingSlot === i}
                      onChange={(v) =>
                        setForm((f) => {
                          if (!f) return f;
                          const images = [...f.images];
                          images[i] = v;
                          return { ...f, images };
                        })
                      }
                      onUpload={(file) => uploadImage(i, file)}
                    />
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink/60">
                  <IconVideo className="h-3.5 w-3.5 text-clay" />
                  فيديو شرح المنتج (رابط يوتيوب) — اختياري
                </label>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  dir="ltr"
                  placeholder="https://youtu.be/…"
                  className="input-base font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">القسم</label>
                <select
                  value={form.categorySlug}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                  className="input-base cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  مصدر المنتج
                </label>
                <div className="grid gap-2.5">
                  {([
                    {
                      v: "stock",
                      t: "متوفر في مخزنا",
                      d: "نتحكم بالكمية ونخصم المخزون تلقائيًا مع كل طلب",
                    },
                    {
                      v: "dropship",
                      t: "دروبشيبينج (مورد خارجي)",
                      d: "يُشحن من مورد شريك عند وصول الطلب، لا نعرض له مخزون",
                    },
                  ] as const).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, source: opt.v })
                      }
                      className={cn(
                        "rounded-2xl border-2 p-3.5 text-start transition",
                        form.source === opt.v
                          ? "border-leaf bg-mint/50"
                          : "border-line bg-paper hover:border-leaf/40"
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs font-extrabold">
                        <span
                          className={cn(
                            "grid h-4 w-4 place-items-center rounded-full border-2",
                            form.source === opt.v
                              ? "border-leaf"
                              : "border-line"
                          )}
                        >
                          {form.source === opt.v && (
                            <span className="h-2 w-2 rounded-full bg-leaf" />
                          )}
                        </span>
                        {opt.t}
                      </span>
                      <span className="mt-1 block pr-6 text-[10px] leading-4 text-ink/50">
                        {opt.d}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  مدة التوصيل لهذا المنتج (أيام) — اختياري
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={form.deliveryDays}
                  onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
                  className="input-base"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/60">السعر *</label>
                  <input type="number" min="1" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-base" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/60">قبل الخصم</label>
                  <input type="number" min="0" value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className="input-base" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/60">المخزون</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input-base" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">شارة</label>
                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="input-base cursor-pointer"
                >
                  <option value="">بدون</option>
                  <option value="جديد">جديد</option>
                  <option value="خصم">خصم</option>
                  <option value="الأكثر مبيعاً">الأكثر مبيعًا</option>
                </select>
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-xs font-bold">
                  <input type="checkbox" checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 accent-[#16337e]" />
                  مميز
                </label>
                <label className="flex items-center gap-2 text-xs font-bold">
                  <input type="checkbox" checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 accent-[#1da463]" />
                  ظاهر في المتجر
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  المقاسات (سطر لكل مقاس)
                </label>
                <textarea
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  className="input-base min-h-16"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/60">
                  الألوان (سطر لكل لون)
                </label>
                <textarea
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  className="input-base min-h-16"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-ink/60">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-base min-h-24"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay sm:col-span-2">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-leaf py-3.5 text-sm font-extrabold text-white transition hover:bg-leaf/90 disabled:opacity-50"
                >
                  {saving ? "جارٍ الحفظ…" : "حفظ المنتج"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-xl bg-paper px-6 py-3.5 text-sm font-bold ring-1 ring-line transition hover:bg-cream"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageSlot({
  index,
  value,
  uploading,
  onChange,
  onUpload,
}: {
  index: number;
  value: string | null;
  uploading: boolean;
  onChange: (v: string | null) => void;
  onUpload: (file: File | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="overflow-hidden rounded-xl bg-paper ring-1 ring-line">
      <div className="relative grid aspect-[4/5] place-items-center bg-mint/60">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={`صورة ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-[10px] font-bold text-ink/35">
            {index === 0 ? "الصورة الرئيسية" : `صورة ${index + 1}`}
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 grid place-items-center bg-ink/50 text-[10px] font-bold text-white">
            جارٍ الرفع…
          </span>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="حذف الصورة"
            className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white transition hover:bg-clay"
          >
            <IconClose className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="space-y-1.5 p-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="رابط مباشر…"
          dir="ltr"
          className="w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-[10px] outline-none focus:border-leaf"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-navy py-1.5 text-[10px] font-extrabold text-white transition hover:bg-navy-deep disabled:opacity-50"
        >
          <IconUpload className="h-3 w-3" />
          رفع صورة
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            onUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

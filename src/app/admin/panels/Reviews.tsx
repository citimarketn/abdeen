"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import RatingStars from "@/components/RatingStars";
import { IconCheck, IconTrash } from "@/components/icons";
import { cn, timeAgo } from "@/lib/utils";

interface ReviewRow {
  id: number;
  name: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  createdAt: string;
  productName: string;
}

const statusBadge: Record<string, string> = {
  approved: "bg-leaf/15 text-leaf",
  pending: "bg-gold/20 text-[#a8781a]",
  rejected: "bg-clay/10 text-clay",
};

export default function ReviewsPanel() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ reviews: ReviewRow[] }>("/api/admin/reviews")
      .then((d) => setReviews(d.reviews))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(null), 2200);
  };

  const setStatus = async (id: number, status: string) => {
    await api("/api/admin/reviews", { method: "PATCH", body: { id, status } });
    notify("تم تحديث التقييم");
    load();
    router.refresh();
  };

  const remove = async (id: number) => {
    await api(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    notify("تم حذف التقييم");
    load();
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {flash && (
        <span className="animate-fade-in inline-block rounded-full bg-leaf/15 px-3 py-1.5 text-xs font-extrabold text-leaf">
          {flash}
        </span>
      )}
      <ul className="grid gap-3 lg:grid-cols-2">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl bg-paper p-5 ring-1 ring-line transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-sm font-black text-white">
                  {r.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-extrabold">
                    {r.name}
                  </span>
                  <span className="line-clamp-1 text-[11px] text-leaf">
                    {r.productName}
                  </span>
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                  statusBadge[r.status]
                )}
              >
                {r.status === "approved"
                  ? "منشور"
                  : r.status === "pending"
                    ? "قيد المراجعة"
                    : "مرفوض"}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <RatingStars value={r.rating} size="xs" />
              <span className="text-[11px] text-ink/40">
                {timeAgo(r.createdAt)}
              </span>
            </div>
            {r.title && (
              <h4 className="mt-2 text-sm font-extrabold">{r.title}</h4>
            )}
            <p className="mt-1 line-clamp-3 text-xs leading-6 text-ink/60">
              {r.body}
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5">
              {r.status !== "approved" ? (
                <button
                  onClick={() => setStatus(r.id, "approved")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-3.5 py-2 text-[11px] font-extrabold text-white transition hover:bg-leaf/90"
                >
                  <IconCheck className="h-3.5 w-3.5" />
                  نشر
                </button>
              ) : (
                <button
                  onClick={() => setStatus(r.id, "rejected")}
                  className="rounded-lg bg-cream px-3.5 py-2 text-[11px] font-extrabold text-ink/50 ring-1 ring-line transition hover:bg-gold/15 hover:text-[#a8781a]"
                >
                  إخفاء من المتجر
                </button>
              )}
              <button
                onClick={() => remove(r.id)}
                className="ms-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold text-clay transition hover:bg-clay/10"
              >
                <IconTrash className="h-3.5 w-3.5" />
                حذف نهائي
              </button>
            </div>
          </li>
        ))}
      </ul>
      {reviews.length === 0 && (
        <div className="rounded-2xl bg-paper py-16 text-center ring-1 ring-line">
          <p className="font-display text-lg font-extrabold">لا توجد تقييمات</p>
        </div>
      )}
    </div>
  );
}

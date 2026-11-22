"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useI18n } from "@/lib/i18n";
import { IconStar } from "./icons";
import { cn } from "@/lib/utils";

export default function ReviewForm({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const router = useRouter();
  const { showToast } = useCart();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !body.trim()) {
      setError("من فضلك اكتب اسمك وتفاصيل تقييمك");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          name: name.trim(),
          rating,
          body: body.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      showToast("شكرًا لك! تم نشر تقييمك");
      setName("");
      setBody("");
      setRating(5);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال التقييم");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-mint/50 p-5 ring-1 ring-mint-deep/60 sm:p-6"
    >
      <h3 className="font-display text-base font-extrabold">
        {t("formTitle")} «{productName}»
      </h3>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink/60">
            {t("yourRating")}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${i} نجوم`}
                className="transition-transform hover:scale-110"
              >
                <IconStar
                  filled={i <= (hover || rating)}
                  className={cn(
                    "h-7 w-7",
                    i <= (hover || rating) ? "text-gold" : "text-ink/15"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink/60">
            {t("yourName")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("yourName")}
            className="input-base"
            maxLength={40}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink/60">
            {t("yourReview")}
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("reviewPh")}
            className="input-base min-h-24 resize-y"
            maxLength={600}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-bold text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-deep disabled:opacity-50"
        >
          {sending ? t("publishing") : t("publish")}
        </button>
      </div>
    </form>
  );
}

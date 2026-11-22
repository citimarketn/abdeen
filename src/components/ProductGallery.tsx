"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  name,
  badge,
  pct,
}: {
  images: string[];
  name: string;
  badge: string | null;
  pct: number;
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      <div className="group relative overflow-hidden rounded-3xl bg-mint ring-1 ring-line">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img}
            alt={`${name} — صورة ${i + 1}`}
            className={cn(
              "aspect-[4/5] w-full object-cover transition-all duration-500",
              i === active
                ? "scale-100 opacity-100"
                : "pointer-events-none absolute inset-0 scale-105 opacity-0"
            )}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-1.5 p-3">
          {pct > 0 && (
            <span className="rounded-full bg-clay px-3 py-1 text-xs font-extrabold text-white shadow-lg">
              خصم {pct.toLocaleString("ar-EG")}٪
            </span>
          )}
          {badge && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-extrabold shadow-lg",
                badge === "جديد"
                  ? "bg-leaf-bright text-ink"
                  : "bg-navy text-white"
              )}
            >
              {badge}
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`الصورة ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-leaf" : "w-1.5 bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`عرض الصورة ${i + 1}`}
              className={cn(
                "h-20 w-16 overflow-hidden rounded-xl ring-2 transition-all duration-300",
                i === active
                  ? "ring-leaf shadow-lg shadow-leaf/20"
                  : "ring-line opacity-70 hover:opacity-100 hover:ring-leaf/50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { IconChevronDown } from "./icons";
import { cn } from "@/lib/utils";

export default function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  const items = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`faq${i}q`),
    a: t(`faq${i}a`),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-2xl bg-paper ring-1 transition-all duration-300",
              isOpen ? "ring-leaf/50 shadow-lg shadow-leaf/5" : "ring-line"
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
              aria-expanded={isOpen}
            >
              <span className="font-display text-[15px] font-bold text-ink">
                {f.q}
              </span>
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300",
                  isOpen ? "rotate-180 bg-leaf text-white" : "bg-mint text-leaf"
                )}
              >
                <IconChevronDown className="h-4 w-4" />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-7 text-ink/65">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

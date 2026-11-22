"use client";

import { useEffect, useState } from "react";
import { IconBot, IconClose, IconWhatsApp } from "./icons";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function SmartAssistant({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const [onDuty, setOnDuty] = useState<{ name: string | null; wa: string }>({
    name: null,
    wa: whatsapp,
  });

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) =>
        setOnDuty({ name: d.onDutyName ?? null, wa: d.onDutyWa ?? whatsapp })
      )
      .catch(() => {});
  }, [whatsapp]);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="المساعد الذكي"
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-navy text-white shadow-2xl shadow-navy/40 transition hover:scale-105 hover:bg-navy-deep"
      >
        <IconBot className="h-6.5 w-6.5" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-leaf-bright ring-2 ring-cream" />
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-5 z-[60] w-[calc(100vw-2.5rem)] max-w-xs origin-bottom-right transition-all duration-300",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-3xl bg-paper shadow-2xl ring-1 ring-line">
          <div className="flex items-center gap-3 bg-navy-deep px-5 py-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf/20 text-leaf-bright">
              <IconBot className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="font-display block text-sm font-black text-white">
                {t("aiTitle")}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-leaf-bright">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf-bright" />
                {onDuty.name
                  ? `متواجد الآن: ${onDuty.name}`
                  : t("aiStatus")}
              </span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 px-5 py-4">
            <div className="max-w-[90%] rounded-2xl rounded-tr-sm bg-mint px-4 py-3 text-xs leading-6 text-ink/75">
              {t("aiMsg")}
            </div>
            <a
              href={`https://wa.me/${onDuty.wa.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-leaf/90"
            >
              <IconWhatsApp className="h-4 w-4" />
              {t("waNowBtn")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

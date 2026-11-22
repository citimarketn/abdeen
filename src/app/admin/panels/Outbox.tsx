"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { IconMail } from "@/components/icons";
import { cn, timeAgo } from "@/lib/utils";

interface EmailRow {
  id: number;
  to: string;
  subject: string;
  provider: string;
  sent: boolean;
  createdAt: string;
}

export default function OutboxPanel() {
  const [emails, setEmails] = useState<EmailRow[]>([]);

  const load = useCallback(() => {
    api<{ emails: EmailRow[] }>("/api/admin/outbox")
      .then((d) => setEmails(d.emails))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-mint/60 px-5 py-4 text-xs leading-6 text-ink/65 ring-1 ring-mint-deep/40">
        <p className="font-extrabold text-leaf">كيف تفعّل الإرسال الفوري؟</p>
        أنشئ حساب مجاني على Resend أو Brevo، انسخ الـ API Key وضعه في
        الإعدادات ← البريد، وكل رسائل الترحيب هتبعت للزباين فورًا. لحد ما
        تفعّله، كل رسالة تتسجل هنا عشان تتأكد من محتواها.
      </div>

      {emails.length === 0 ? (
        <div className="grid place-items-center rounded-2xl bg-paper py-16 ring-1 ring-line">
          <div className="text-center">
            <IconMail className="mx-auto h-10 w-10 text-ink/20" />
            <p className="mt-3 text-sm font-bold text-ink/45">
              لا توجد رسائل بعد — أول تسجيل عضو هيولّد رسالة ترحيب هنا.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {emails.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-paper px-5 py-4 ring-1 ring-line"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-leaf">
                <IconMail className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-sm font-extrabold">
                  {e.subject}
                </span>
                <span className="text-[11px] text-ink/45" dir="ltr">
                  {e.to}
                </span>
              </span>
              <span className="text-[10px] text-ink/40">{timeAgo(e.createdAt)}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                  e.sent
                    ? "bg-leaf/15 text-leaf"
                    : "bg-gold/15 text-gold"
                )}
              >
                {e.sent
                  ? `أُرسلت (${e.provider})`
                  : "في الصندوق — فعّل مزود البريد"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { db } from "@/db";
import { outbox } from "@/db/schema";
import { getSettings, type StoreSettings } from "./store";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ sent: boolean; via: string }> {
  const s = await getSettings();
  let via = "outbox";
  let sent = false;
  const plainText = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const fromAddress = s.emailFrom || "Abdeen <onboarding@resend.dev>";

  try {
    if (s.emailProvider === "resend" && s.emailApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s.emailApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
          text: plainText,
        }),
      });
      if (res.ok) {
        via = "resend";
        sent = true;
      }
    } else if (s.emailProvider === "pa" && s.paMailUrl) {
      const res = await fetch(s.paMailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Abdeen-Key": s.paMailKey || "",
        },
        body: JSON.stringify({ to, subject, html, text: plainText }),
      });
      if (res.ok) {
        via = "pythonanywhere";
        sent = true;
      }
    } else if (s.emailProvider === "brevo" && s.emailApiKey) {
      const match = fromAddress.match(/<([^>]+)>/);
      const senderEmail = match ? match[1] : fromAddress;
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: s.emailApiKey,
        },
        body: JSON.stringify({
          sender: { name: "عابدين", email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: plainText,
        }),
      });
      if (res.ok) {
        via = "brevo";
        sent = true;
      }
    }
  } catch {
    /* fall through to outbox */
  }

  await db.insert(outbox).values({ to, subject, provider: via, sent });
  return { sent, via };
}

export function welcomeEmailHtml(name: string, s: StoreSettings): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = (name || "").trim().split(/\s+/)[0] || "عميلنا العزيز";
  const subject = `أهلاً بك في عابدين، ${firstName}`;
  const whatsappClean = (s.whatsapp || "").replace(/[^0-9+]/g, "");
  const whatsappLink = whatsappClean ? `https://wa.me/${whatsappClean.replace(/^\+/, "")}` : "";

  const html = `
  <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background:#f6f4ee; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#fffef9; border-radius:20px; overflow:hidden; border:1px solid #e5e1d6;">
      <div style="background:#0b1a3e; padding:24px 28px; text-align:center;">
        <div style="font-size:24px; font-weight:700; color:#ffffff;">عابدين</div>
        <div style="font-size:11px; letter-spacing:3px; color:#2ecc71; margin-top:4px;">ONLINE STORE</div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 10px; font-size:20px; font-weight:700; color:#101f3c;">أهلاً ${firstName}</h1>
        <p style="margin:0 0 16px; font-size:15px; line-height:1.8; color:#101f3c;">
          تم إنشاء حسابك في متجر عابدين، ويمكنك الآن إدارة بياناتك ومتابعة طلباتك بسهولة.
        </p>
        <div style="background:#f2f7f4; border:1px solid #d5e8dc; border-radius:14px; padding:14px 18px; margin-bottom:20px;">
          <div style="font-size:14px; font-weight:700; color:#101f3c; margin-bottom:6px;">مزايا حسابك:</div>
          <ul style="margin:0; padding-right:18px; font-size:14px; color:#101f3c; line-height:1.8;">
            <li>حفظ بيانات الشحن لإتمام الطلبات بشكل أسرع</li>
            <li>متابعة حالة الطلبات من صفحة «حسابي»</li>
            <li>الاطلاع على العروض والمنتجات الجديدة</li>
          </ul>
        </div>
        <a href="https://abdeen.vercel.app/" style="display:block; background:#1da463; color:#ffffff; text-align:center; padding:13px 16px; border-radius:12px; font-size:15px; font-weight:700; text-decoration:none; margin-bottom:20px;">زيارة المتجر</a>
        <p style="margin:16px 0 0; font-size:13px; line-height:1.8; color:#3a4863;">
          للمساعدة أو الاستفسار: ${
            whatsappLink
              ? `<a href="${whatsappLink}" style="color:#1da463; text-decoration:underline;">تواصل معنا عبر واتساب</a>`
              : `واتساب ${s.whatsapp}`
          }
        </p>
      </div>
      <div style="background:#f6f4ee; padding:16px 28px; text-align:center; font-size:12px; color:#5a657a;">
        متجر عابدين
      </div>
    </div>
  </div>`;

  const text = [
    `أهلاً ${firstName}،`,
    "تم إنشاء حسابك في متجر عابدين.",
    "- حفظ بيانات الشحن لإتمام الطلبات بشكل أسرع",
    "- متابعة حالة الطلبات من صفحة «حسابي»",
    "- الاطلاع على العروض والمنتجات الجديدة",
    "رابط المتجر: https://abdeen.vercel.app/",
    s.whatsapp ? `واتساب الدعم: ${s.whatsapp}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
import { db } from "@/db";
import { outbox } from "@/db/schema";
import { getSettings, type StoreSettings } from "./store";

/**
 * Send an email. Uses a provider when configured in admin settings
 * (Resend / Brevo API key), otherwise logs to the outbox so the owner
 * can see every email that was composed — swap in your provider key
 * from Admin → Settings → Email to go live.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ sent: boolean; via: string }> {
  const s = await getSettings();
  let via = "outbox";
  let sent = false;

  try {
    if (s.emailProvider === "resend" && s.emailApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s.emailApiKey}`,
        },
        body: JSON.stringify({
          from: s.emailFrom || "Abdeen <onboarding@resend.dev>",
          to: [to],
          subject,
          html,
        }),
      });
      if (res.ok) {
        via = "resend";
        sent = true;
      }
    } else if (s.emailProvider === "pa" && s.paMailUrl) {
      // PythonAnywhere self-hosted mail service (python/abdeen_mail.py)
      const res = await fetch(s.paMailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Abdeen-Key": s.paMailKey || "",
        },
        body: JSON.stringify({ to, subject, html }),
      });
      if (res.ok) {
        via = "pythonanywhere";
        sent = true;
      }
    } else if (s.emailProvider === "brevo" && s.emailApiKey) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: s.emailApiKey,
        },
        body: JSON.stringify({
          sender: { name: "Abdeen" },
          to: [{ email: to }],
          subject,
          htmlContent: html,
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
} {
  const firstName = (name || "").split(" ")[0] || "عميلنا العزيز";
  const subject = "أهلًا بك في عابدين — حسابك مفعّل ✓";
  const html = `
  <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; background:#f6f4ee; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#fffef9; border-radius:24px; overflow:hidden; border:1px solid #e5e1d6;">
      <div style="background:#0b1a3e; padding:28px 32px; text-align:center;">
        <div style="font-size:26px; font-weight:800; color:#fff;">عابدين</div>
        <div style="font-size:10px; letter-spacing:4px; color:#2ecc71; margin-top:4px;">ONLINE STORE</div>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 8px; font-size:22px; color:#101f3c;">أهلًا ${firstName} 🎉</h1>
        <p style="margin:0 0 16px; font-size:15px; line-height:1.9; color:#101f3c99;">
          تم تفعيل حسابك في متجر عابدين بنجاح، وبنستناك في العيلة.
        </p>
        <div style="background:#e6f4ea; border:1px solid #c4e6d2; border-radius:16px; padding:16px 20px; margin-bottom:20px;">
          <div style="font-size:14px; font-weight:700; color:#1da463; margin-bottom:8px;">حسابك دلوقتي بيديك:</div>
          <div style="font-size:13px; color:#101f3c; line-height:2;">
            ✓ إتمام أسرع ببياناتك محفوظة<br/>
            ✓ تتبع طلباتك من «حسابي»<br/>
            ✓ أولوية في العروض الجديدة
          </div>
        </div>
       <a href="https://abdeen.vercel.app/" style="display:block; background:#1da463; color:#fff; text-align:center; padding:14px; border-radius:14px; font-size:15px; font-weight:700; text-decoration:none; margin-bottom:20px;">يلا نبدأ التسوق</a>
       <p style="margin:24px 0 0; font-size:13px; line-height:1.9; color:#101f3c99;">
          لو عندك أي سؤال، فريقنا على واتساب ${s.whatsapp} جاهز يخدمك.
        </p>
      </div>
      <div style="background:#f6f4ee; padding:18px 32px; text-align:center; font-size:11px; color:#101f3c80;">
        © ${new Date().getFullYear()} عابدين — تسوّق وكأّنت على الأرض
      </div>
    </div>
  </div>`;
  return { subject, html };
}

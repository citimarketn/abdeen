import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "@/lib/store";
import {
  hashPassword,
  newSessionToken,
  verifyGoogleIdToken,
} from "@/lib/auth";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

function publicCustomer(c: {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  createdAt: Date;
}) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    city: c.city,
    address: c.address,
    createdAt: c.createdAt,
  };
}

export async function POST(req: Request) {
  try {
    const b = await req.json();

    // 1) Google sign-in (auto-register on first use) — runs before manual email validation
    if (b?.action === "google") {
      const idToken = String(b?.idToken ?? b?.credential ?? "").trim();
      if (!idToken) {
        return NextResponse.json(
          { error: "رمز تحقق جوجل مفقود" },
          { status: 400 }
        );
      }

      const settings = await getSettings();
      const clientId =
        String(settings?.googleClientId ?? "").trim() ||
        String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();

      const google = await verifyGoogleIdToken(idToken, clientId);
      if (!google?.email) {
        return NextResponse.json(
          {
            error:
              "تعذر التحقق من حساب جوجل — تأكد من تفعيل Google Client ID في الإعدادات",
          },
          { status: 401 }
        );
      }

      const googleEmail = String(google.email).trim().toLowerCase();
      const [existing] = await db
        .select()
        .from(customers)
        .where(eq(customers.email, googleEmail));

      let row = existing;
      if (!row) {
        const fallbackName = googleEmail.split("@")[0] || "عميل";
        const [created] = await db
          .insert(customers)
          .values({
            name: String(google.name ?? fallbackName).trim().slice(0, 60),
            email: googleEmail,
            passwordHash: hashPassword(newSessionToken()),
          })
          .returning();
        row = created;

        const s = await getSettings();
        const w = welcomeEmailHtml(row.name, s);
        sendEmail(row.email, w.subject, w.html).catch(() => {});
      }

      const token = newSessionToken();
      await db
        .update(customers)
        .set({ sessionToken: token })
        .where(eq(customers.id, row.id));

      return NextResponse.json({
        ok: true,
        token,
        customer: publicCustomer(row),
      });
    }

    // 2) Manual register / login email validation
    const email = String(b?.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "أدخل بريداً إلكترونياً صحيحاً" },
        { status: 400 }
      );
    }

    if (b?.action === "register") {
      const name = String(b?.name ?? "").trim().slice(0, 60);
      const phone = b?.phone ? String(b.phone).trim().slice(0, 20) : null;
      const password = String(b?.password ?? "");
      if (!name) {
        return NextResponse.json(
          { error: "الاسم مطلوب" },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: "كلمة المرور 6 أحرف على الأقل" },
          { status: 400 }
        );
      }
      const [exists] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.email, email));
      if (exists) {
        return NextResponse.json(
          { error: "هذا الإيميل مسجل بالفعل — سجّل دخولك" },
          { status: 409 }
        );
      }
      const token = newSessionToken();
      const [row] = await db
        .insert(customers)
        .values({
          name,
          email,
          phone,
          passwordHash: hashPassword(password),
          sessionToken: token,
        })
        .returning();

      const s = await getSettings();
      const w = welcomeEmailHtml(name, s);
      sendEmail(email, w.subject, w.html).catch(() => {});
      return NextResponse.json({ ok: true, token, customer: publicCustomer(row) });
    }

    // 3) Manual login
    const [row] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));
    if (!row || row.passwordHash !== hashPassword(String(b?.password ?? ""))) {
      return NextResponse.json(
        { error: "إيميل أو كلمة مرور غير صحيحة" },
        { status: 401 }
      );
    }

    const token = newSessionToken();
    await db
      .update(customers)
      .set({ sessionToken: token })
      .where(eq(customers.id, row.id));

    return NextResponse.json({ ok: true, token, customer: publicCustomer(row) });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "حدث خطأ، حاول مجددًا" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const token = req.headers.get("x-customer-token");
  if (!token) {
    return NextResponse.json({ customer: null });
  }
  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.sessionToken, token));
  if (!row) return NextResponse.json({ customer: null });
  return NextResponse.json({ customer: publicCustomer(row) });
}

export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("x-customer-token");
    if (!token) {
      return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
    }
    const [row] = await db
      .select()
      .from(customers)
      .where(eq(customers.sessionToken, token));
    if (!row) {
      return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
    }
    const b = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof b.name === "string" && b.name.trim()) {
      patch.name = b.name.trim().slice(0, 60);
    }
    if (typeof b.phone === "string") {
      patch.phone = b.phone.trim().slice(0, 20);
    }
    if (typeof b.city === "string") {
      patch.city = b.city.trim().slice(0, 40);
    }
    if (typeof b.address === "string") {
      patch.address = b.address.trim().slice(0, 300);
    }
    if (typeof b.password === "string" && b.password.length >= 6) {
      patch.passwordHash = hashPassword(b.password);
    }
    if (Object.keys(patch).length > 0) {
      await db.update(customers).set(patch).where(eq(customers.id, row.id));
    }
    const [updated] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, row.id));
    return NextResponse.json({ ok: true, customer: publicCustomer(updated) });
  } catch {
    return NextResponse.json(
      { error: "تعذر حفظ التعديلات" },
      { status: 500 }
    );
  }
}

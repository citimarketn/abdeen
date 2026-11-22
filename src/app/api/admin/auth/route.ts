import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import {
  getAdminByEmail,
  hashPassword,
  issueSession,
  publicProfile,
  verifyGoogleIdToken,
} from "@/lib/auth";
import { OWNER_EMAIL, OWNER_DEFAULT_PASSWORD } from "@/db/seed";

export const dynamic = "force-dynamic";

/** Public login-screen config (no secrets). */
export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    ownerEmail: s.adminEmail,
    demoPassword: OWNER_DEFAULT_PASSWORD,
    demoCodes: [s.secCode1, s.secCode2, s.secCode3],
    googleConfigured: Boolean(s.googleClientId),
    googleClientId: s.googleClientId,
  });
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const settings = await getSettings();

    // ---- Google sign-in ----
    if (b?.step === "google") {
      if (!settings.googleClientId) {
        return NextResponse.json(
          { error: "تسجيل جوجل غير مفعّل — ضع معرّف Google Client في الإعدادات" },
          { status: 400 }
        );
      }
      const google = await verifyGoogleIdToken(
        String(b.idToken ?? ""),
        settings.googleClientId
      );
      if (!google) {
        return NextResponse.json(
          { error: "تعذر التحقق من حساب جوجل" },
          { status: 401 }
        );
      }
      const admin = await getAdminByEmail(google.email);
      if (!admin || !admin.active) {
        return NextResponse.json(
          { error: "هذا الحساب غير مخوّل بالدخول إلى لوحة التحكم" },
          { status: 403 }
        );
      }
      const token = await issueSession(admin.id);
      return NextResponse.json({ ok: true, token, profile: publicProfile(admin) });
    }

    // ---- Step 1: email + password ----
    if (b?.step === "password") {
      const email = String(b.email ?? "").trim().toLowerCase();
      const admin = await getAdminByEmail(email);
      if (!admin || !admin.active) {
        return NextResponse.json(
          { error: "الإيميل غير مسجل في لوحة التحكم" },
          { status: 403 }
        );
      }
      if (admin.passwordHash !== hashPassword(String(b.password ?? ""))) {
        return NextResponse.json(
          { error: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }
      return NextResponse.json({ ok: true, needCodes: true, adminId: admin.id });
    }

    // ---- Step 2: three security codes ----
    if (b?.step === "codes") {
      const { db } = await import("@/db");
      const { admins } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.id, Number(b.adminId)));
      if (!admin || !admin.active) {
        return NextResponse.json({ error: "الجلسة انتهت" }, { status: 401 });
      }
      const ok =
        String(b.code1 ?? "") === settings.secCode1 &&
        String(b.code2 ?? "") === settings.secCode2 &&
        String(b.code3 ?? "") === settings.secCode3;
      if (!ok) {
        return NextResponse.json(
          { error: "أكواد الحماية غير صحيحة" },
          { status: 401 }
        );
      }
      const token = await issueSession(admin.id);
      return NextResponse.json({ ok: true, token, profile: publicProfile(admin) });
    }

    return NextResponse.json({ error: "خطوة غير معروفة" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}

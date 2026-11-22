import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireOwner } from "../_guard";
import { hashPassword, newSessionToken } from "@/lib/auth";
import { ALL_PERMISSIONS } from "@/db/seed";

export const dynamic = "force-dynamic";

function strip(a: (typeof admins.$inferSelect)) {
  const { passwordHash: _p, sessionToken: _t, ...rest } = a;
  return rest;
}

export async function GET(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  const rows = await db.select().from(admins).orderBy(asc(admins.createdAt));
  return NextResponse.json({ admins: rows.map(strip) });
}

export async function POST(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const name = String(b?.name ?? "").trim();
    const email = String(b?.email ?? "").trim().toLowerCase();
    const password = String(b?.password ?? "");
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 6) {
      return NextResponse.json(
        { error: "أكمل الاسم وإيميل صحيح وكلمة مرور (6 أحرف على الأقل)" },
        { status: 400 }
      );
    }
    const [exists] = await db.select().from(admins).where(eq(admins.email, email));
    if (exists) {
      return NextResponse.json(
        { error: "هذا الإيميل مسجل بالفعل" },
        { status: 409 }
      );
    }
    const perms = Array.isArray(b?.permissions)
      ? (b.permissions as string[]).filter((p) => ALL_PERMISSIONS.includes(p))
      : [];
    await db.insert(admins).values({
      name,
      email,
      passwordHash: hashPassword(password),
      role: "supervisor",
      permissions: perms,
      active: true,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر إضافة المشرف" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const id = Number(b?.id);
    if (!id) {
      return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    }
    const [target] = await db.select().from(admins).where(eq(admins.id, id));
    if (!target) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
    if (target.role === "owner") {
      return NextResponse.json(
        { error: "لا يمكن تعديل حساب المالك" },
        { status: 403 }
      );
    }
    const patch: Record<string, unknown> = {};
    if (typeof b.name === "string" && b.name.trim()) patch.name = b.name.trim();
    if (Array.isArray(b.permissions)) {
      patch.permissions = (b.permissions as string[]).filter((p) =>
        ALL_PERMISSIONS.includes(p)
      );
    }
    if (typeof b.active === "boolean") patch.active = b.active;
    if (b.password) patch.passwordHash = hashPassword(String(b.password));
    if (Object.keys(patch).length > 0) {
      await db.update(admins).set(patch).where(eq(admins.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر تحديث المشرف" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }
  const [target] = await db.select().from(admins).where(eq(admins.id, id));
  if (target?.role === "owner") {
    return NextResponse.json(
      { error: "لا يمكن حذف حساب المالك" },
      { status: 403 }
    );
  }
  await db.delete(admins).where(eq(admins.id, id));
  return NextResponse.json({ ok: true });
}

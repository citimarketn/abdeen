import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireOwner } from "../_guard";

export const dynamic = "force-dynamic";

const PERM_KEYS = ["orders", "reviews", "products", "categories"];

export async function GET(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  const rows = await db.select().from(staff).orderBy(asc(staff.createdAt));
  return NextResponse.json({ staff: rows });
}

export async function POST(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const name = String(b?.name ?? "").trim();
    const email = String(b?.email ?? "").trim().toLowerCase();
    const whatsapp = String(b?.whatsapp ?? "").replace(/[^0-9]/g, "");
    const role = b?.role === "manager" ? "manager" : "field";
    if (!name || !email || whatsapp.length < 8) {
      return NextResponse.json(
        { error: "أكمل الاسم والإيميل ورقم واتساب صحيح (مع كود الدولة)" },
        { status: 400 }
      );
    }
    const [exists] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.email, email));
    if (exists) {
      return NextResponse.json(
        { error: "هذا الإيميل مضاف بالفعل" },
        { status: 409 }
      );
    }
    const permissions =
      role === "manager" && Array.isArray(b?.permissions)
        ? (b.permissions as string[]).filter((p) => PERM_KEYS.includes(p))
        : [];
    await db.insert(staff).values({
      name,
      email,
      whatsapp,
      role,
      permissions,
      active: true,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر إضافة العضو" },
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
    const patch: Record<string, unknown> = {};
    if (typeof b.name === "string" && b.name.trim()) patch.name = b.name.trim();
    if (typeof b.whatsapp === "string") {
      patch.whatsapp = b.whatsapp.replace(/[^0-9]/g, "");
    }
    if (b.role === "manager" || b.role === "field") patch.role = b.role;
    if (typeof b.onDuty === "boolean") patch.onDuty = b.onDuty;
    if (typeof b.dutyRequested === "boolean") patch.dutyRequested = b.dutyRequested;
    if (typeof b.active === "boolean") patch.active = b.active;
    if (Array.isArray(b.permissions)) {
      patch.permissions = (b.permissions as string[]).filter((p) =>
        PERM_KEYS.includes(p)
      );
    }
    if (Object.keys(patch).length > 0) {
      await db.update(staff).set(patch).where(eq(staff.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر التحديث" },
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
  await db.delete(staff).where(eq(staff.id, id));
  return NextResponse.json({ ok: true });
}

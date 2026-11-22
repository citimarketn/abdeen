import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, staff } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-customer-token");
    if (!token) {
      return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
    }
    const [cust] = await db
      .select()
      .from(customers)
      .where(eq(customers.sessionToken, token));
    if (!cust) {
      return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
    }
    const [me] = await db
      .select()
      .from(staff)
      .where(and(eq(staff.email, cust.email), eq(staff.active, true)));
    if (!me) {
      return NextResponse.json(
        { error: "لست من فريق العمل" },
        { status: 403 }
      );
    }
    const b = await req.json();
    if (b?.mode === "request") {
      await db
        .update(staff)
        .set({ dutyRequested: true, onDuty: false })
        .where(eq(staff.id, me.id));
      return NextResponse.json({ ok: true, requested: true });
    }
    if (b?.mode === "off") {
      await db
        .update(staff)
        .set({ dutyRequested: false, onDuty: false })
        .where(eq(staff.id, me.id));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "إجراء غير معروف" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  customers,
  orderHandoffs,
  orders,
  staff,
} from "@/db/schema";
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
    const orderId = Number(b?.orderId);
    const toStaffId = Number(b?.toStaffId);
    if (!orderId || !toStaffId) {
      return NextResponse.json(
        { error: "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }
    const [to] = await db.select().from(staff).where(eq(staff.id, toStaffId));
    if (!to || !to.active) {
      return NextResponse.json(
        { error: "الزميل غير موجود" },
        { status: 400 }
      );
    }
    await db.insert(orderHandoffs).values({
      orderId: order.id,
      orderNo: order.orderNo,
      fromName: me.name,
      toStaffId: to.id,
      toName: to.name,
    });
    await db
      .update(orders)
      .set({ assignedToStaffId: to.id, assignedToName: to.name, waNumber: to.whatsapp })
      .where(eq(orders.id, order.id));
    return NextResponse.json({ ok: true, toName: to.name, waNumber: to.whatsapp });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "تعذر ترحيل الطلب" },
      { status: 500 }
    );
  }
}

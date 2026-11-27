import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orders, orderHandoffs, staff } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSettings } from "@/lib/store";
import { releaseOrder } from "@/lib/store";

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
        { error: "هذا الحساب غير مخوّل بدخول صندوق الوارد" },
        { status: 403 }
      );
    }

    const b = await req.json();
    const orderId = Number(b?.orderId);
    const reason = b?.reason ? String(b.reason).slice(0, 200) : undefined;
    if (!orderId) {
      return NextResponse.json(
        { error: "معرف الطلب مطلوب" },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const result = await releaseOrder(orderId, me.id, settings.whatsapp, reason);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Log the release as a handoff to "Team Inbox"
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (order) {
      await db.insert(orderHandoffs).values({
        orderId: order.id,
        orderNo: order.orderNo,
        fromName: me.name,
        toStaffId: null,
        toName: "صندوق وارد الفريق",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرجاع الطلب" },
      { status: 500 }
    );
  }
}
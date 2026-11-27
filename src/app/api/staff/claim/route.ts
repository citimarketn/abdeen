import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orders, staff } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getSettings } from "@/lib/store";
import { claimOrder } from "@/lib/store";

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
    if (!orderId) {
      return NextResponse.json(
        { error: "معرف الطلب مطلوب" },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const result = await claimOrder(orderId, me.id, me.name, me.whatsapp);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      orderNo: result.orderNo,
      assignedToName: result.assignedToName,
      waNumber: result.waNumber,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "حدث خطأ أثناء استلام الطلب" },
      { status: 500 }
    );
  }
}
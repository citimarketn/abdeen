import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  customers,
  orderHandoffs,
  orderItems,
  orders,
  staff,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

  const list = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(60);
  if (list.length === 0) {
    return NextResponse.json({
      me,
      orders: [],
      handoffs: [],
      onDutyTeammates: [],
    });
  }
  const ids = list.map((o) => o.id);
  const [items, handoffs, teammates] = await Promise.all([
    db.select().from(orderItems).where(inArray(orderItems.orderId, ids)),
    db
      .select()
      .from(orderHandoffs)
      .where(inArray(orderHandoffs.orderId, ids))
      .orderBy(desc(orderHandoffs.createdAt)),
    db
      .select()
      .from(staff)
      .where(and(eq(staff.active, true), eq(staff.onDuty, true))),
  ]);

  const counts = new Map<number, { count: number; total: number }>();
  const itemsByOrder = new Map<number, typeof items>();
  for (const it of items) {
    const c = counts.get(it.orderId) ?? { count: 0, total: 0 };
    c.count += it.qty;
    c.total += it.price * it.qty;
    counts.set(it.orderId, c);
    const arr = itemsByOrder.get(it.orderId) ?? [];
    arr.push(it);
    itemsByOrder.set(it.orderId, arr);
  }

  return NextResponse.json({
    me,
    orders: list.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      customerName: o.customerName,
      phone: o.phone,
      city: o.city,
      address: o.address,
      payment: o.payment,
      notes: o.notes,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      total: o.total,
      status: o.status,
      assignedToStaffId: o.assignedToStaffId,
      assignedToName: o.assignedToName,
      waNumber: o.waNumber,
      createdAt: o.createdAt,
      itemsCount: counts.get(o.id)?.count ?? 0,
      items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
        productName: it.productName,
        options: it.options,
        price: it.price,
        qty: it.qty,
      })),
    })),
    handoffs,
    onDutyTeammates: teammates,
  });
}

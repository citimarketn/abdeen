import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orderItems, orders } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
  const list = await db
    .select()
    .from(orders)
    .where(eq(orders.email, row.email))
    .orderBy(desc(orders.createdAt));
  if (list.length === 0) return NextResponse.json({ orders: [] });

  const byId = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, list.map((o) => o.id)));

  const counts = new Map<number, number>();
  for (const it of byId) {
    counts.set(it.orderId, (counts.get(it.orderId) ?? 0) + it.qty);
  }
  return NextResponse.json({
    orders: list.map((o) => ({
      orderNo: o.orderNo,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      itemsCount: counts.get(o.id) ?? 0,
    })),
  });
}

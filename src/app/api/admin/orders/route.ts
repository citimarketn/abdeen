import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { requirePerm } from "../_guard";
import { ORDER_STATUSES } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requirePerm(req, "orders");
  if (g.res) return g.res;
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));
  if (allOrders.length === 0) {
    return NextResponse.json({ orders: [] });
  }
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, allOrders.map((o) => o.id)));
  const byOrder = new Map<number, typeof items>();
  for (const it of items) {
    const list = byOrder.get(it.orderId) ?? [];
    list.push(it);
    byOrder.set(it.orderId, list);
  }
  return NextResponse.json({
    orders: allOrders.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] })),
  });
}

export async function PATCH(req: Request) {
  const g = await requirePerm(req, "orders");
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const id = Number(b?.id);
    const status = String(b?.status ?? "");
    if (!id || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر تحديث حالة الطلب" },
      { status: 500 }
    );
  }
}

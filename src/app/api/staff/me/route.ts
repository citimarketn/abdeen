import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, staff } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = req.headers.get("x-customer-token");
  if (!token) return NextResponse.json({ staff: null });
  const [cust] = await db
    .select()
    .from(customers)
    .where(eq(customers.sessionToken, token));
  if (!cust) return NextResponse.json({ staff: null });
  const [me] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.email, cust.email), eq(staff.active, true)));
  if (!me) return NextResponse.json({ staff: null });
  return NextResponse.json({ staff: me });
}

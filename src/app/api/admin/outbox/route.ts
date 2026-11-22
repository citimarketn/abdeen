import { NextResponse } from "next/server";
import { db } from "@/db";
import { outbox } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireOwner } from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requireOwner(req);
  if (g.res) return g.res;
  const rows = await db.select().from(outbox).orderBy(desc(outbox.createdAt)).limit(50);
  return NextResponse.json({ emails: rows });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Public, non-sensitive client config. */
export async function GET() {
  const s = await getSettings();
  const [onDuty] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.active, true), eq(staff.onDuty, true)))
    .limit(1);
  return NextResponse.json({
    googleConfigured: Boolean(s.googleClientId),
    googleClientId: s.googleClientId,
    onDutyName: onDuty?.name ?? null,
    onDutyWa: onDuty?.whatsapp ?? s.whatsapp,
    storeWa: s.whatsapp,
  });
}

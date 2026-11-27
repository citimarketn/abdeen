import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Public, non-sensitive client config. */
export async function GET() {
  const s = await getSettings();
  // Get all on-duty staff for the AI assistant to know who's available
  const onDutyStaff = await db
    .select()
    .from(staff)
    .where(and(eq(staff.active, true), eq(staff.onDuty, true)));

  // Main store WhatsApp (owner's) - fixed for store contact, AI assistant
  // On-duty staff WhatsApp - used when customer clicks on their specific order
  return NextResponse.json({
    googleConfigured: Boolean(s.googleClientId),
    googleClientId: s.googleClientId,
    onDutyStaff: onDutyStaff.map(s => ({
      id: s.id,
      name: s.name,
      whatsapp: s.whatsapp,
      role: s.role,
    })),
    // Legacy single on-duty (first one) for backward compatibility
    onDutyName: onDutyStaff[0]?.name ?? null,
    onDutyWa: onDutyStaff[0]?.whatsapp ?? s.whatsapp,
    // Main store WhatsApp (owner's) - ALWAYS used for store contact, AI assistant, general inquiries
    storeWa: s.whatsapp,
  });
}

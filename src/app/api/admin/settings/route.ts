import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePerm } from "../_guard";
import { DEFAULT_SETTINGS } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requirePerm(req, "settings");
  if (g.res) return g.res;
  const rows = await db.select().from(settings);
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json({ settings: map });
}

export async function PUT(req: Request) {
  const g = await requirePerm(req, "settings");
  if (g.res) return g.res;
  try {
    const map = (await req.json()) as Record<string, unknown>;
    for (const [key, value] of Object.entries(map)) {
      if (!DEFAULT_SETTINGS.hasOwnProperty(key)) continue;
      const v = String(value ?? "");
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key));
      if (existing.length > 0) {
        await db.update(settings).set({ value: v }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value: v });
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر حفظ الإعدادات" },
      { status: 500 }
    );
  }
}

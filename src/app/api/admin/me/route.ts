import { NextResponse } from "next/server";
import { publicProfile } from "@/lib/auth";
import { requirePerm } from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requirePerm(req);
  if (g.res || !g.admin) return g.res ?? NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json({ profile: publicProfile(g.admin) });
}

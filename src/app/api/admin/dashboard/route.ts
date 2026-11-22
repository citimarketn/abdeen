import { NextResponse } from "next/server";
import { getAdminDashboard } from "@/lib/store";
import { requirePerm } from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requirePerm(req, "dashboard");
  if (g.res) return g.res;
  const data = await getAdminDashboard();
  if (!data) {
    return NextResponse.json({ error: "فشل جلب البيانات" }, { status: 500 });
  }
  return NextResponse.json(data);
}

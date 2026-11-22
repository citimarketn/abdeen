import { NextResponse } from "next/server";
import { getAdminForRequest } from "@/lib/auth";
import type { Admin } from "@/db/schema";

export interface GuardResult {
  admin: Admin | null;
  res: NextResponse | null;
}

/**
 * Guard an admin route. Owner bypasses; supervisors need the given permission.
 */
export async function requirePerm(
  req: Request,
  perm?: string
): Promise<GuardResult> {
  const admin = await getAdminForRequest(req);
  if (!admin) {
    return {
      admin: null,
      res: NextResponse.json({ error: "غير مصرح" }, { status: 401 }),
    };
  }
  if (
    perm &&
    admin.role !== "owner" &&
    !(admin.permissions ?? []).includes(perm)
  ) {
    return {
      admin,
      res: NextResponse.json(
        { error: "لا تملك صلاحية تنفيذ هذه العملية" },
        { status: 403 }
      ),
    };
  }
  return { admin, res: null };
}

export async function requireOwner(req: Request): Promise<GuardResult> {
  const admin = await getAdminForRequest(req);
  if (!admin) {
    return {
      admin: null,
      res: NextResponse.json({ error: "غير مصرح" }, { status: 401 }),
    };
  }
  if (admin.role !== "owner") {
    return {
      admin,
      res: NextResponse.json(
        { error: "هذه العملية مسموح بها للمالك فقط" },
        { status: 403 }
      ),
    };
  }
  return { admin, res: null };
}

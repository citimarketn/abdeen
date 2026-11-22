import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requirePerm } from "../_guard";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requirePerm(req, "categories");
  if (g.res) return g.res;
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  return NextResponse.json({ categories: rows });
}

export async function POST(req: Request) {
  const g = await requirePerm(req, "categories");
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const name = String(b?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "اسم القسم مطلوب" }, { status: 400 });
    }
    if (b?.id) {
      await db
        .update(categories)
        .set({
          name,
          image: b?.image ? String(b.image) : undefined,
          active: b?.active === false ? false : true,
        })
        .where(eq(categories.id, Number(b.id)));
      return NextResponse.json({ ok: true });
    }
    const slug = makeSlug(b?.slug || name);
    await db.insert(categories).values({
      name,
      slug,
      image: b?.image ? String(b.image) : null,
      sortOrder: Math.floor(Number(b?.sortOrder) || 99),
      active: true,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر حفظ القسم" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const g = await requirePerm(req, "categories");
  if (g.res) return g.res;
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}

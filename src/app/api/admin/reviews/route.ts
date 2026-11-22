import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requirePerm } from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await requirePerm(req, "reviews");
  if (g.res) return g.res;
  const rows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      name: reviews.name,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      status: reviews.status,
      createdAt: reviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .orderBy(desc(reviews.createdAt));
  return NextResponse.json({ reviews: rows });
}

export async function PATCH(req: Request) {
  const g = await requirePerm(req, "reviews");
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const id = Number(b?.id);
    const status = String(b?.status ?? "");
    if (!id || !["approved", "pending", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    await db.update(reviews).set({ status }).where(eq(reviews.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "تعذر تحديث التقييم" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const g = await requirePerm(req, "reviews");
  if (g.res) return g.res;
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }
  await db.delete(reviews).where(eq(reviews.id, id));
  return NextResponse.json({ ok: true });
}

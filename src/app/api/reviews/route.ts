import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productSlug = String(body?.productSlug ?? "");
    const name = String(body?.name ?? "").trim().slice(0, 40);
    const rating = Math.min(5, Math.max(1, Number(body?.rating) || 5));
    const title = body?.title ? String(body.title).trim().slice(0, 60) : null;
    const text = String(body?.body ?? "").trim().slice(0, 600);

    if (!productSlug || !name || !text) {
      return NextResponse.json(
        { error: "من فضلك أكمل الاسم وتفاصيل التقييم" },
        { status: 400 }
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, productSlug));
    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    await db.insert(reviews).values({
      productId: product.id,
      name,
      rating,
      title,
      body: text,
      status: "approved",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "تعذر إضافة التقييم" },
      { status: 500 }
    );
  }
}

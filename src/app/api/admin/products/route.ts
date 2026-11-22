import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requirePerm } from "../_guard";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

function listInput(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean).slice(0, 4);
  if (typeof v === "string")
    return v
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
  return [];
}

export async function GET(req: Request) {
  const g = await requirePerm(req, "products");
  if (g.res) return g.res;
  const [productsList, categoriesList] = await Promise.all([
    db.select().from(products).orderBy(asc(products.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  return NextResponse.json({
    products: productsList,
    categories: categoriesList,
  });
}

export async function POST(req: Request) {
  const g = await requirePerm(req, "products");
  if (g.res) return g.res;
  try {
    const b = await req.json();
    const name = String(b?.name ?? "").trim();
    const price = Math.max(0, Math.floor(Number(b?.price) || 0));
    if (!name || price <= 0) {
      return NextResponse.json(
        { error: "الاسم والسعر (أكبر من صفر) مطلوبان" },
        { status: 400 }
      );
    }
    const images = listInput(b?.images);
    if (images.length > 4) {
      return NextResponse.json(
        { error: "الحد الأقصى 4 صور للمنتج" },
        { status: 400 }
      );
    }
    const categorySlug = String(b?.categorySlug ?? "womens");
    const oldPrice =
      b?.oldPrice == null || String(b.oldPrice) === ""
        ? null
        : Math.max(0, Math.floor(Number(b.oldPrice)));
    const videoUrl =
      b?.videoUrl && String(b.videoUrl).trim()
        ? String(b.videoUrl).trim().slice(0, 300)
        : null;
    const deliveryDays =
      b?.deliveryDays == null || String(b.deliveryDays) === ""
        ? null
        : Math.min(60, Math.max(0, Math.floor(Number(b.deliveryDays))));
    const source =
      b?.source === "dropship" ? "dropship" : "stock";

    const values = {
      name,
      description: b?.description ? String(b.description).slice(0, 2000) : null,
      categorySlug,
      price,
      oldPrice,
      stock: Math.max(0, Math.floor(Number(b?.stock) || 0)),
      images,
      sizes: listInput(b?.sizes),
      colors: listInput(b?.colors),
      badge: b?.badge ? String(b.badge).slice(0, 30) : null,
      featured: Boolean(b?.featured),
      active: b?.active === false ? false : true,
      videoUrl,
      deliveryDays,
      source,
    };

    if (b?.id) {
      await db.update(products).set(values).where(eq(products.id, Number(b.id)));
      return NextResponse.json({ ok: true });
    }

    const slug =
      b?.slug && String(b.slug).trim()
        ? makeSlug(String(b.slug))
        : makeSlug(`p-${Date.now().toString(36)}`);
    await db.insert(products).values({ ...values, slug });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "تعذر حفظ المنتج" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const g = await requirePerm(req, "products");
  if (g.res) return g.res;
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}

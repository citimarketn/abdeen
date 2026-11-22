import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { requirePerm } from "../_guard";

export const dynamic = "force-dynamic";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  const g = await requirePerm(req, "products");
  if (g.res) return g.res;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "لم يتم إرسال ملف" },
        { status: 400 }
      );
    }
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "الصيغ المسموحة: JPG / PNG / WEBP / GIF" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "حجم الصورة يتجاوز 3 ميجابايت" },
        { status: 400 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const dir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });
    const safeName = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}${ext}`;
    await writeFile(join(dir, safeName), buf);
    return NextResponse.json({ ok: true, url: `/uploads/products/${safeName}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "تعذر رفع الصورة" },
      { status: 500 }
    );
  }
}

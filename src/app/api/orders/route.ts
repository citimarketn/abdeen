import { NextResponse } from "next/server";
import { createOrder, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await getSettings();

    if (
      !body ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      !body.customerName ||
      !body.phone ||
      !body.address
    ) {
      return NextResponse.json(
        { error: "بيانات الطلب ناقصة — أكمل كل الحقول المطلوبة" },
        { status: 400 }
      );
    }

    const result = await createOrder({
      items: body.items,
      customerName: String(body.customerName).slice(0, 80),
      phone: String(body.phone).slice(0, 20),
      email: body.email ? String(body.email).slice(0, 120) : undefined,
      city: String(body.city ?? "—").slice(0, 40),
      address: String(body.address).slice(0, 300),
      payment: body.payment === "card" ? "card" : "cod",
      notes: body.notes ? String(body.notes).slice(0, 200) : undefined,
      freeShippingOver: settings.freeShippingOver,
      freeShippingEnabled: settings.freeShippingEnabled,
      shippingFee: settings.shippingFee,
      ownerWa: settings.whatsapp,
      storeName: settings.storeName,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({
      ok: true,
      orderNo: result.orderNo,
      assignedToName: result.assignedToName,
      waNumber: result.waNumber,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
